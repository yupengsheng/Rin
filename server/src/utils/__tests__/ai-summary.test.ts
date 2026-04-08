import { afterEach, describe, expect, it, mock } from "bun:test";
import { AI_SUMMARY_SYSTEM_PROMPT, generateAISummaryResult } from "../ai";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function createServerConfig(values: Record<string, unknown>) {
  return {
    async get(key: string) {
      return values[key];
    },
  };
}

describe("generateAISummaryResult", () => {
  it("returns a concrete error when AI responds with empty content", async () => {
    const result = await generateAISummaryResult({
      AI: {
        run: async () => ({ response: "" }),
      },
    } as unknown as Env, createServerConfig({
      "ai_summary.enabled": "true",
      "ai_summary.provider": "worker-ai",
      "ai_summary.model": "llama-3-8b",
    }), "test content");

    expect(result.summary).toBeNull();
    expect(result.skipped).toBe(false);
    expect(result.error).toContain('Empty response from AI provider "worker-ai"');
  });

  it("sends summary system prompt to Workers AI", async () => {
    const calls: Array<any> = [];

    const result = await generateAISummaryResult({
      AI: {
        run: async (_model: string, payload: any) => {
          calls.push(payload);
          return { response: "summary" };
        },
      },
    } as unknown as Env, createServerConfig({
      "ai_summary.enabled": "true",
      "ai_summary.provider": "worker-ai",
      "ai_summary.model": "llama-3-8b",
    }), "test content");

    expect(result.summary).toBe("summary");
    expect(calls).toHaveLength(1);
    expect(calls[0].messages[0]).toEqual({
      role: "system",
      content: AI_SUMMARY_SYSTEM_PROMPT,
    });
    expect(calls[0].messages[1]).toEqual({
      role: "user",
      content: "test content",
    });
  });

  it("sends summary system prompt to external AI providers", async () => {
    const requests: Array<any> = [];
    globalThis.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
      requests.push(init);
      return new Response(JSON.stringify({
        choices: [{ message: { content: "summary" } }],
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const result = await generateAISummaryResult({} as Env, createServerConfig({
      "ai_summary.enabled": "true",
      "ai_summary.provider": "openai",
      "ai_summary.model": "gpt-4o-mini",
      "ai_summary.api_key": "secret",
      "ai_summary.api_url": "https://api.openai.com/v1",
    }), "external content");

    expect(result.summary).toBe("summary");
    expect(requests).toHaveLength(1);
    const body = JSON.parse(String(requests[0].body));
    expect(body.messages[0]).toEqual({
      role: "system",
      content: AI_SUMMARY_SYSTEM_PROMPT,
    });
    expect(body.messages[1]).toEqual({
      role: "user",
      content: "external content",
    });
  });
});
