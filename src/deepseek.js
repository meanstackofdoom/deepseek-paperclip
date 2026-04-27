const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";

function normalizeBaseUrl(url) {
  return (url || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function firstNonEmpty(values) {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return "";
}

function toReasoningContent(message) {
  if (!message || typeof message !== "object") {
    return "";
  }

  const reasoning = firstNonEmpty([
    message.reasoning_content,
    message.reasoningContent,
    message.reasoning
  ]);

  return reasoning;
}

export function normalizeMessagesForThinkingMode(messages = []) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.map((message) => {
    if (!message || typeof message !== "object") {
      return message;
    }

    if (message.role !== "assistant") {
      return { ...message };
    }

    const normalized = { ...message };
    const reasoningContent = toReasoningContent(message);
    if (reasoningContent && !normalized.reasoning_content) {
      normalized.reasoning_content = reasoningContent;
    }
    if (typeof normalized.content !== "string") {
      normalized.content = normalized.content ?? "";
    }

    return normalized;
  });
}

export function getDeepSeekConfig(env = process.env) {
  const apiKey = firstNonEmpty([
    env.DEEPSEEK_API,
    env.DEEPSEEK_API_KEY,
    env.DEEPSEEK_API_TOKEN,
    env.OPENAI_API_KEY
  ]);

  const gatewayAuthToken = firstNonEmpty([
    env.DEEPSEEK_GATEWAY_AUTH_TOKEN,
    env.GOVERNOR_AUTH_TOKEN,
    env.CODEX_RUNTIME_AUTH_TOKEN
  ]);

  return {
    apiKey,
    gatewayAuthToken,
    baseUrl: normalizeBaseUrl(env.DEEPSEEK_BASE_URL),
    model: env.DEEPSEEK_MODEL || DEFAULT_MODEL
  };
}

export function buildDeepSeekHeaders(cfg) {
  const authorizationToken = cfg.gatewayAuthToken || cfg.apiKey;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authorizationToken}`
  };

  // Governor/gateway paths can require bearer auth while upstream provider key
  // is forwarded explicitly as an API-key style header.
  if (cfg.gatewayAuthToken) {
    headers["api-key"] = cfg.apiKey;
    headers["x-api-key"] = cfg.apiKey;
  }

  return headers;
}

export async function deepseekChat({
  messages,
  model,
  temperature = 0.2,
  maxTokens = 600
}, env = process.env) {
  const cfg = getDeepSeekConfig(env);
  if (!cfg.apiKey) {
    throw new Error(
      "Missing DeepSeek API key. Set DEEPSEEK_API, DEEPSEEK_API_KEY, DEEPSEEK_API_TOKEN, or OPENAI_API_KEY."
    );
  }

  const payload = {
    model: model || cfg.model,
    messages: normalizeMessagesForThinkingMode(messages),
    temperature,
    max_tokens: maxTokens
  };

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: buildDeepSeekHeaders(cfg),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DeepSeek request failed (${res.status}): ${body}`);
  }

  return res.json();
}

export function extractText(completion) {
  return completion?.choices?.[0]?.message?.content || "";
}

export function extractReasoning(completion) {
  return completion?.choices?.[0]?.message?.reasoning_content || "";
}

export function appendAssistantTurn(messages = [], completion) {
  return [
    ...normalizeMessagesForThinkingMode(messages),
    {
      role: "assistant",
      content: extractText(completion),
      reasoning_content: extractReasoning(completion)
    }
  ];
}
