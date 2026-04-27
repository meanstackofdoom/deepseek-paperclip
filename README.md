# Edict Protocol DeepSeek Integration

This workspace now includes a baseline DeepSeek integration that can be used as
the policy/reasoning layer for agentic transaction checks.

## Included

- `src/deepseek.js`: DeepSeek client using OpenAI-compatible `chat/completions`.
- `src/intent-gate.js`: simple intent-evaluation flow for risk gating prompts.
- `scripts/smoke.js`: live smoke test (uses `DEEPSEEK_API` or `OPENAI_API_KEY`).
- `test/deepseek.test.js`: unit tests for config and request payload shape.
- `site/`: protocol website implementation for trust model, SDK quick-start,
  economics, and terminal demo.

## Environment

Copy `.env.example` values into your runtime environment:

- `DEEPSEEK_API`: preferred provider API key.
- `OPENAI_API_KEY`: compatibility fallback used when DeepSeek-specific key vars are unset.
- `DEEPSEEK_API_KEY` / `DEEPSEEK_API_TOKEN`: additional DeepSeek key aliases.
- `DEEPSEEK_BASE_URL`: default `https://api.deepseek.com`.
- `DEEPSEEK_GATEWAY_AUTH_TOKEN` (optional): bearer token for governor/runtime gateway auth.
  - Aliases also supported: `GOVERNOR_AUTH_TOKEN`, `CODEX_RUNTIME_AUTH_TOKEN`.
- `DEEPSEEK_MODEL`: one of:
  - `deepseek-chat`
  - `deepseek-reasoner`
  - `deepseek-v4-flash`
  - `deepseek-v4-pro`

## Run

```bash
npm test
npm run smoke
npm run site:preview
```

If no key is present (`DEEPSEEK_API`, `DEEPSEEK_API_KEY`, `DEEPSEEK_API_TOKEN`, or
`OPENAI_API_KEY`), smoke test exits successfully with a skip message.
