import JSZip from "jszip";
import { and, desc, eq } from "drizzle-orm";
import { feeds } from "../db/schema";
import type { DB } from "../core/hono-types";

type ExportableFeed = {
  id: number;
  alias: string | null;
  title: string | null;
  summary: string;
  ai_summary: string;
  ai_summary_status: "idle" | "pending" | "processing" | "completed" | "failed";
  content: string;
  createdAt: Date;
  updatedAt: Date;
  hashtags: Array<{ hashtag: { name: string } }>;
};

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function escapeYamlString(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function sanitizeFileSegment(value: string) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[^\w\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "post";
}

function buildFrontmatter(feed: ExportableFeed) {
  const lines = [
    "---",
    `title: ${escapeYamlString(feed.title || `Post ${feed.id}`)}`,
    `createdAt: ${feed.createdAt.toISOString()}`,
    `updatedAt: ${feed.updatedAt.toISOString()}`,
  ];

  if (feed.alias) {
    lines.push(`alias: ${escapeYamlString(feed.alias)}`);
  }

  if (feed.summary) {
    lines.push(`summary: ${escapeYamlString(feed.summary)}`);
  }

  if (feed.ai_summary) {
    lines.push(`ai_summary: ${escapeYamlString(feed.ai_summary)}`);
  }

  if (feed.ai_summary_status !== "idle") {
    lines.push(`ai_summary_status: ${escapeYamlString(feed.ai_summary_status)}`);
  }

  const tags = feed.hashtags.map(({ hashtag }) => hashtag.name).filter(Boolean);
  if (tags.length > 0) {
    lines.push("tags:");
    for (const tag of tags) {
      lines.push(`  - ${tag}`);
    }
  }

  lines.push("---", "");

  return lines.join("\n");
}

function buildMarkdown(feed: ExportableFeed) {
  return `${buildFrontmatter(feed)}${feed.content}`;
}

function buildFileName(feed: ExportableFeed) {
  const datePart = formatDate(feed.createdAt);
  const slugPart = sanitizeFileSegment(feed.alias || String(feed.id));
  return `${datePart}-${slugPart}.md`;
}

export async function buildPostsBackupZip(db: DB) {
  const items = await db.query.feeds.findMany({
    where: and(eq(feeds.draft, 0), eq(feeds.listed, 1)),
    columns: {
      id: true,
      alias: true,
      title: true,
      summary: true,
      ai_summary: true,
      ai_summary_status: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      hashtags: {
        columns: {},
        with: {
          hashtag: {
            columns: { name: true },
          },
        },
      },
    },
    orderBy: [desc(feeds.createdAt), desc(feeds.updatedAt)],
  }) as ExportableFeed[];

  const zip = new JSZip();

  for (const item of items) {
    zip.file(buildFileName(item), buildMarkdown(item));
  }

  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}
