import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDeepSeekHeaders,
  deepseekChat,
  getDeepSeekConfig,
  extractText,
  appendAssistantTurn,
  normalizeMessagesForThinkingMode
} from "../src/deepseek.js";

test("getDeepSeekConfig reads env values", () => {
  const cfg = getDeepSeekConfig({
    DEEPSEEK_API: "abc",
    DEEPSEEK_BASE_URL: "https://api.deepseek.com/",
    DEEPSEEK_MODEL: "deepseek-reasoner"
  });

  assert.equal(cfg.apiKey, "abc");
  assert.equal(cfg.baseUrl, "https://api.deepseek.com");
  assert.equal(cfg.model, "deepseek-reasoner");
});

test("getDeepSeekConfig falls back to OPENAI_API_KEY and trims values", () => {
  const cfg = getDeepSeekConfig({
    OPENAI_API_KEY: "  openai-key  ",
    DEEPSEEK_BASE_URL: "https://api.deepseek.com/"
  });

  assert.equal(cfg.apiKey, "openai-key");
  assert.equal(cfg.baseUrl, "https://api.deepseek.com");
});

test("buildDeepSeekHeaders supports gateway auth token split", () => {
  const headers = buildDeepSeekHeaders({
    apiKey: "provider-key",
    gatewayAuthToken: "gateway-token"
  });

  assert.equal(headers.Authorization, "Bearer gateway-token");
  assert.equal(headers["api-key"], "provider-key");
  assert.equal(headers["x-api-key"], "provider-key");
});

test("deepseekChat sends OpenAI-compatible payload", async () => {
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      async json() {
        return {
          choices: [{ message: { content: "{\"decision\":\"review\",\"reason\":\"high amount\"}" } }]
        };
      }
    };
  };

  const result = await deepseekChat({
    messages: [{ role: "user", content: "hi" }],
    temperature: 0,
    maxTokens: 20
  }, { DEEPSEEK_API: "k", DEEPSEEK_BASE_URL: "https://api.deepseek.com" });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.deepseek.com/chat/completions");
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.model, "deepseek-chat");
  assert.equal(body.messages[0].role, "user");
  assert.equal(calls[0].init.headers.Authorization, "Bearer k");
  assert.equal(result.choices[0].message.content.includes("decision"), true);
});

test("deepseekChat uses gateway auth token when present", async () => {
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      async json() {
        return { choices: [{ message: { content: "ok" } }] };
      }
    };
  };

  await deepseekChat({
    messages: [{ role: "user", content: "hi" }]
  }, {
    DEEPSEEK_API: "provider-key",
    GOVERNOR_AUTH_TOKEN: "runtime-token",
    DEEPSEEK_BASE_URL: "https://api.deepseek.com"
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.headers.Authorization, "Bearer runtime-token");
  assert.equal(calls[0].init.headers["api-key"], "provider-key");
  assert.equal(calls[0].init.headers["x-api-key"], "provider-key");
});

test("deepseekChat falls back to OPENAI_API_KEY when DeepSeek key aliases are unset", async () => {
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      async json() {
        return { choices: [{ message: { content: "ok" } }] };
      }
    };
  };

  await deepseekChat({
    messages: [{ role: "user", content: "hi" }]
  }, {
    OPENAI_API_KEY: "openai-fallback-key",
    DEEPSEEK_BASE_URL: "https://api.deepseek.com"
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.headers.Authorization, "Bearer openai-fallback-key");
});

test("extractText returns first choice text", () => {
  assert.equal(extractText({ choices: [{ message: { content: "ok" } }] }), "ok");
});

test("normalizeMessagesForThinkingMode sets assistant reasoning_content from aliases", () => {
  const messages = normalizeMessagesForThinkingMode([
    { role: "user", content: "hello" },
    { role: "assistant", content: "answer", reasoningContent: "hidden-chain" }
  ]);

  assert.equal(messages[1].reasoning_content, "hidden-chain");
  assert.equal(messages[1].content, "answer");
});

test("deepseekChat forwards assistant reasoning_content for continuation", async () => {
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      async json() {
        return { choices: [{ message: { content: "ok" } }] };
      }
    };
  };

  await deepseekChat({
    messages: [
      { role: "user", content: "q1" },
      { role: "assistant", content: "a1", reasoningContent: "r1" },
      { role: "user", content: "q2" }
    ]
  }, { DEEPSEEK_API: "k", DEEPSEEK_BASE_URL: "https://api.deepseek.com" });

  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.messages[1].reasoning_content, "r1");
});

test("appendAssistantTurn appends assistant content and reasoning_content", () => {
  const next = appendAssistantTurn(
    [{ role: "user", content: "q1" }],
    { choices: [{ message: { content: "a1", reasoning_content: "r1" } }] }
  );

  assert.equal(next.length, 2);
  assert.equal(next[1].role, "assistant");
  assert.equal(next[1].content, "a1");
  assert.equal(next[1].reasoning_content, "r1");
});
