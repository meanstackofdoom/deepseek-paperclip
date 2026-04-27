import OpenAI from "openai";
import { getDeepSeekConfig } from "./deepseek.js";

export const DEEPSEEK_MODELS = Object.freeze({
  CHAT: "deepseek-chat",
  REASONER: "deepseek-reasoner",
  V4_FLASH: "deepseek-v4-flash",
  V4_PRO: "deepseek-v4-pro"
});

function getClientConfig(env = process.env) {
  const cfg = getDeepSeekConfig(env);
  if (!cfg.apiKey) {
    throw new Error(
      "Missing DeepSeek credential. Set DEEPSEEK_API, DEEPSEEK_API_KEY, DEEPSEEK_API_TOKEN, or OPENAI_API_KEY."
    );
  }

  const defaultHeaders = {};
  if (cfg.gatewayAuthToken) {
    defaultHeaders["api-key"] = cfg.apiKey;
    defaultHeaders["x-api-key"] = cfg.apiKey;
  }

  return {
    apiKey: cfg.gatewayAuthToken || cfg.apiKey,
    baseURL: cfg.baseUrl,
    defaultHeaders
  };
}

export function createDeepSeekClient(env = process.env) {
  return new OpenAI(getClientConfig(env));
}

export async function runDeepSeekChat({
  model = DEEPSEEK_MODELS.CHAT,
  prompt
}, env = process.env) {
  if (!prompt) {
    throw new Error("Prompt is required.");
  }

  const client = createDeepSeekClient(env);
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  return {
    model: response.model,
    output: response.choices?.[0]?.message?.content ?? "",
    usage: response.usage ?? null
  };
}
