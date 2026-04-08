import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { SearchService } from "../feed";
import { Hono } from "hono";
import type { Variables } from "../../core/hono-types";
import { cleanupTestDB, createTestUser, setupTestApp } from "../../../tests/fixtures";
import type { Database } from "bun:sqlite";

describe("SearchService", () => {
  let sqlite: Database;
  let env: Env;
  let app: Hono<{ Bindings: Env; Variables: Variables }>;

  beforeEach(async () => {
    const ctx = await setupTestApp(SearchService);
    sqlite = ctx.sqlite;
    env = ctx.env;
    app = ctx.app;

    createTestUser(sqlite);
  });

  afterEach(() => {
    cleanupTestDB(sqlite);
  });

  it("returns paginated search results through FTS", async () => {
    sqlite.exec(`
      INSERT INTO feeds (id, title, summary, content, listed, draft, uid, created_at, updated_at)
      VALUES
        (1, 'Alpha Search', 'First result', 'Alpha keyword inside content', 1, 0, 1, unixepoch(), unixepoch()),
        (2, 'Beta Search', 'Second result', 'Alpha keyword appears again', 1, 0, 1, unixepoch(), unixepoch());
    `);

    const firstPage = await app.request("/Alpha?page=1&limit=1", { method: "GET" }, env);
    expect(firstPage.status).toBe(200);
    const firstData = await firstPage.json() as any;
    expect(firstData.size).toBe(2);
    expect(firstData.data).toHaveLength(1);
    expect(firstData.hasNext).toBe(true);

    const secondPage = await app.request("/Alpha?page=2&limit=1", { method: "GET" }, env);
    expect(secondPage.status).toBe(200);
    const secondData = await secondPage.json() as any;
    expect(secondData.size).toBe(2);
    expect(secondData.data).toHaveLength(1);
  });

  it("does not expose draft or unlisted posts to public search", async () => {
    sqlite.exec(`
      INSERT INTO feeds (id, title, summary, content, listed, draft, uid, created_at, updated_at)
      VALUES
        (1, 'Visible Search Result', 'Visible', 'Special public keyword', 1, 0, 1, unixepoch(), unixepoch()),
        (2, 'Draft Search Result', 'Hidden', 'Special public keyword', 1, 1, 1, unixepoch(), unixepoch()),
        (3, 'Unlisted Search Result', 'Hidden', 'Special public keyword', 0, 0, 1, unixepoch(), unixepoch());
    `);

    const res = await app.request("/Special?page=1&limit=10", { method: "GET" }, env);
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.size).toBe(1);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].title).toBe("Visible Search Result");
  });

  it("allows admin search to include drafts and unlisted posts", async () => {
    sqlite.exec(`
      INSERT INTO feeds (id, title, summary, content, listed, draft, uid, created_at, updated_at)
      VALUES
        (1, 'Draft Search Result', 'Hidden', 'Admin-only keyword', 1, 1, 1, unixepoch(), unixepoch()),
        (2, 'Unlisted Search Result', 'Hidden', 'Admin-only keyword', 0, 0, 1, unixepoch(), unixepoch());
    `);

    const res = await app.request("/Admin-only?page=1&limit=10", {
      method: "GET",
      headers: { Authorization: "Bearer mock_token_1" },
    }, env);

    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.size).toBe(2);
    expect(data.data).toHaveLength(2);
  });
});
