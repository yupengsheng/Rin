import { Hono } from "hono";
import type { AppContext } from "../core/hono-types";
import { asc, eq } from "drizzle-orm";
import { comments, feeds, users } from "../db/schema";
import { profileAsync } from "../core/server-timing";
import { notify } from "../utils/webhook";
import { resolveWebhookConfig } from "./config-helpers";

export function CommentService(): Hono {
    const app = new Hono();

    function previewContent(content: string) {
        const normalized = content.replace(/\s+/g, ' ').trim();
        return normalized.length > 120 ? `${normalized.slice(0, 120)}...` : normalized;
    }

    app.get('/:feed', async (c: AppContext) => {
        const db = c.get('db');
        const feedId = parseInt(c.req.param('feed'));
        
        const comment_list = await profileAsync(c, 'comment_list_db', () => db.query.comments.findMany({
            where: eq(comments.feedId, feedId),
            columns: {
                feedId: false,
                userId: false,
                authorEmail: false,
            },
            with: {
                user: {
                    columns: { id: true, username: true, avatar: true, permission: true }
                }
            },
            orderBy: [asc(comments.createdAt), asc(comments.id)]
        }));

        const byId = new Map(comment_list.map((item: any) => [item.id, item]));

        return c.json(comment_list.map((item: any) => {
            const parent = item.parentId ? byId.get(item.parentId) : null;
            const authorName = item.authorName || item.user?.username || 'Anonymous';
            return {
                id: item.id,
                content: item.content,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                parentId: item.parentId ?? null,
                author: {
                    name: authorName,
                    avatar: item.user?.avatar || null,
                    url: item.authorUrl || null,
                    isAdmin: item.user?.permission === 1,
                },
                replyTo: parent ? {
                    id: parent.id,
                    authorName: parent.authorName || parent.user?.username || 'Anonymous',
                    contentPreview: previewContent(parent.content),
                } : null,
            };
        }));
    });

    app.post('/:feed', async (c: AppContext) => {
        const db = c.get('db');
        const env = c.get('env');
        const serverConfig = c.get('serverConfig');
        const uid = c.get('uid');
        const feedId = parseInt(c.req.param('feed'));
        const body = await profileAsync(c, 'comment_create_parse', () => c.req.json());
        const { content, authorName, authorEmail, authorUrl, parentId } = body as {
            content?: string;
            authorName?: string;
            authorEmail?: string;
            authorUrl?: string;
            parentId?: number;
        };
        
        if (!content) {
            return c.text('Content is required', 400);
        }
        if (!authorName?.trim()) {
            return c.text('Author name is required', 400);
        }
        if (!authorEmail?.trim()) {
            return c.text('Author email is required', 400);
        }

        const user = uid === undefined
            ? null
            : await profileAsync(c, 'comment_create_user', () => db.query.users.findFirst({ where: eq(users.id, uid) }));

        const exist = await profileAsync(c, 'comment_create_feed', () => db.query.feeds.findFirst({ where: eq(feeds.id, feedId) }));
        if (!exist) {
            return c.text('Feed not found', 400);
        }

        let normalizedParentId: number | null = null;
        if (typeof parentId === 'number') {
            const parent = await profileAsync(c, 'comment_create_parent', () => db.query.comments.findFirst({ where: eq(comments.id, parentId) }));
            if (!parent) {
                return c.text('Parent comment not found', 400);
            }
            if (parent.feedId !== feedId) {
                return c.text('Parent comment does not belong to this feed', 400);
            }
            normalizedParentId = parent.id;
        }

        await profileAsync(c, 'comment_create_insert', () => db.insert(comments).values({
            feedId,
            userId: user?.id ?? null,
            parentId: normalizedParentId,
            authorName: authorName.trim(),
            authorEmail: authorEmail.trim(),
            authorUrl: authorUrl?.trim() ? authorUrl.trim() : null,
            content,
        }));

        const {
            webhookUrl,
            webhookMethod,
            webhookContentType,
            webhookHeaders,
            webhookBodyTemplate,
        } = await profileAsync(c, 'comment_create_webhook_config', () => resolveWebhookConfig(serverConfig, env));
        const frontendUrl = new URL(c.req.url).origin;
        try {
            await profileAsync(c, 'comment_create_notify', () => notify(
                webhookUrl || "",
                {
                    event: "comment.created",
                    message: `${frontendUrl}/feed/${feedId}\n${authorName.trim()} 评论了: ${exist.title}\n${content}`,
                    title: exist.title || "",
                    url: `${frontendUrl}/feed/${feedId}`,
                    username: authorName.trim(),
                    content,
                },
                {
                    method: webhookMethod,
                    contentType: webhookContentType,
                    headers: webhookHeaders,
                    bodyTemplate: webhookBodyTemplate,
                },
            ));
        } catch (error) {
            console.error("Failed to send comment webhook", error);
        }
        return c.text('OK');
    });

    app.delete('/:id', async (c: AppContext) => {
        const db = c.get('db');
        const admin = c.get('admin');
        
        if (!admin) {
            return c.text('Unauthorized', 401);
        }
        
        const id_num = parseInt(c.req.param('id'));
        const comment = await profileAsync(c, 'comment_delete_lookup', () => db.query.comments.findFirst({ where: eq(comments.id, id_num) }));
        
        if (!comment) {
            return c.text('Not found', 404);
        }
        
        await profileAsync(c, 'comment_delete_replies', () => db.delete(comments).where(eq(comments.parentId, id_num)));
        await profileAsync(c, 'comment_delete_db', () => db.delete(comments).where(eq(comments.id, id_num)));
        return c.text('OK');
    });

    return app;
}
