import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { CommentService } from '../comments';
import { Hono } from "hono";
import type { Variables } from "../../core/hono-types";
import { setupTestApp, cleanupTestDB } from '../../../tests/fixtures';
import type { Database } from 'bun:sqlite';

describe('CommentService', () => {
    let db: any;
    let sqlite: Database;
    let env: Env;
    let app: Hono<{ Bindings: Env; Variables: Variables }>;
    const originalFetch = globalThis.fetch;

    beforeEach(async () => {
        const ctx = await setupTestApp(CommentService);
        db = ctx.db;
        sqlite = ctx.sqlite;
        env = ctx.env;
        app = ctx.app;
        
        // Seed test data
        await seedTestData(sqlite);
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        cleanupTestDB(sqlite);
    });

    async function seedTestData(sqlite: Database) {
        // Insert test users
        sqlite.exec(`
            INSERT INTO users (id, username, avatar, permission, openid) VALUES 
                (1, 'user1', 'avatar1.png', 0, 'gh_1'),
                (2, 'user2', 'avatar2.png', 0, 'gh_2'),
                (3, 'admin', 'admin.png', 1, 'gh_admin')
        `);

        // Insert test feeds
        sqlite.exec(`
            INSERT INTO feeds (id, title, content, uid, draft, listed) VALUES 
                (1, 'Feed 1', 'Content 1', 1, 0, 1),
                (2, 'Feed 2', 'Content 2', 1, 0, 1)
        `);

        // Insert test comments
        sqlite.exec(`
            INSERT INTO comments (id, feed_id, user_id, parent_id, author_name, author_email, author_url, content, created_at) VALUES 
                (1, 1, 2, NULL, 'User 2', 'user2@example.com', 'https://user2.example.com', 'Comment 1 on feed 1', unixepoch()),
                (2, 1, NULL, 1, 'Guest Reply', 'guest@example.com', NULL, 'Reply to comment 1', unixepoch()),
                (3, 2, 1, NULL, 'User 1', 'user1@example.com', NULL, 'Comment on feed 2', unixepoch())
        `);
    }

    describe('GET /:feed - List comments', () => {
        it('should return comments for a feed', async () => {
            const res = await app.request('/1', { method: 'GET' }, env);
            
            expect(res.status).toBe(200);
            const data = await res.json() as any;
            expect(data).toBeArray();
            expect(data.length).toBe(2);
            expect(data[0]).toHaveProperty('content');
            expect(data[0]).toHaveProperty('author');
            expect(data[0].author).toHaveProperty('name');
        });

        it('should return empty array when feed has no comments', async () => {
            // Create new feed without comments
            sqlite.exec(`INSERT INTO feeds (id, title, content, uid) VALUES (3, 'No Comments', 'Content', 1)`);
            
            const res = await app.request('/3', { method: 'GET' }, env);
            
            expect(res.status).toBe(200);
            const data = await res.json() as any;
            expect(data).toEqual([]);
        });

        it('should not expose sensitive fields', async () => {
            const res = await app.request('/1', { method: 'GET' }, env);
            
            expect(res.status).toBe(200);
            const data = await res.json() as any;
            expect(data.length).toBeGreaterThan(0);
            
            // Should not include feedId and userId (excluded in query)
            expect(data[0]).not.toHaveProperty('feedId');
            expect(data[0]).not.toHaveProperty('userId');
            expect(data[0]).not.toHaveProperty('authorEmail');
            
            // Should include author info
            expect(data[0].author).toHaveProperty('name');
            expect(data[0].author).toHaveProperty('avatar');
            expect(data[0].author).toHaveProperty('url');
            expect(data[0].author).toHaveProperty('isAdmin');
        });

        it('should include reply metadata', async () => {
            const res = await app.request('/1', { method: 'GET' }, env);
            
            expect(res.status).toBe(200);
            const data = await res.json() as any;
            expect(data.length).toBe(2);
            expect(data[1].parentId).toBe(1);
            expect(data[1].replyTo.authorName).toBe('User 2');
        });
    });

    describe('POST /:feed - Create comment', () => {
        it('should create anonymous comment without authentication', async () => {
            const res = await app.request('/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: 'New test comment',
                    authorName: 'Guest',
                    authorEmail: 'guest@example.com',
                    authorUrl: 'https://guest.example.com',
                }),
            }, env);

            expect(res.status).toBe(200);
            
            // Verify comment was created
            const comments = sqlite.prepare(`SELECT * FROM comments WHERE feed_id = 1 AND content = 'New test comment'`).all() as any[];
            expect(comments.length).toBe(1);
            expect(comments[0].author_name).toBe('Guest');
            expect(comments[0].author_email).toBe('guest@example.com');
            expect(comments[0].author_url).toBe('https://guest.example.com');
        });

        it('should create reply comment with parentId', async () => {
            const res = await app.request('/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: 'Nested reply',
                    authorName: 'Reply User',
                    authorEmail: 'reply@example.com',
                    parentId: 1,
                }),
            }, env);

            expect(res.status).toBe(200);

            const comments = sqlite.prepare(`SELECT * FROM comments WHERE content = 'Nested reply'`).all() as any[];
            expect(comments.length).toBe(1);
            expect(comments[0].parent_id).toBe(1);
        });

        it('should require content', async () => {
            const res = await app.request('/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: '', authorName: 'Guest', authorEmail: 'guest@example.com' }),
            }, env);

            expect(res.status).toBe(400);
        });

        it('should require author name', async () => {
            const res = await app.request('/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: 'Test', authorEmail: 'guest@example.com' }),
            }, env);

            expect(res.status).toBe(400);
        });

        it('should require author email', async () => {
            const res = await app.request('/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: 'Test', authorName: 'Guest' }),
            }, env);

            expect(res.status).toBe(400);
        });

        it('should return 400 for non-existent feed', async () => {
            const res = await app.request('/999', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: 'Test', authorName: 'Guest', authorEmail: 'guest@example.com' }),
            }, env);

            expect(res.status).toBe(400);
        });

        it('should reject replies to comments on another feed', async () => {
            const res = await app.request('/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: 'Cross-feed reply',
                    authorName: 'Guest',
                    authorEmail: 'guest@example.com',
                    parentId: 3,
                }),
            }, env);

            expect(res.status).toBe(400);
        });

        it('should still create the comment when webhook delivery fails', async () => {
            env.WEBHOOK_URL = 'not-a-valid-url' as any;
            globalThis.fetch = mock(async () => {
                throw new TypeError('Invalid URL');
            }) as typeof fetch;

            const res = await app.request('/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: 'Comment survives webhook errors',
                    authorName: 'Guest',
                    authorEmail: 'guest@example.com',
                }),
            }, env);

            expect(res.status).toBe(200);

            const comments = sqlite.prepare(`SELECT * FROM comments WHERE feed_id = 1`).all();
            expect(comments.length).toBe(3);
        });
    });

    describe('DELETE /:id - Delete comment', () => {
        it('should allow admin to delete any comment', async () => {
            const res = await app.request('/1', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer mock_token_3' },
            }, env);

            expect(res.status).toBe(200);
        });

        it('should cascade delete direct replies', async () => {
            const res = await app.request('/1', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer mock_token_3' },
            }, env);

            expect(res.status).toBe(200);
            const rows = sqlite.prepare(`SELECT * FROM comments WHERE id IN (1, 2)`).all();
            expect(rows.length).toBe(0);
        });

        it('should deny deletion by non-admin users', async () => {
            const res = await app.request('/1', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer mock_token_1' },
            }, env);

            expect(res.status).toBe(401);
        });

        it('should require authentication', async () => {
            const res = await app.request('/1', { method: 'DELETE' }, env);

            expect(res.status).toBe(401);
        });

        it('should return 404 for non-existent comment', async () => {
            const res = await app.request('/999', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer mock_token_3' },
            }, env);

            expect(res.status).toBe(404);
        });
    });
});
