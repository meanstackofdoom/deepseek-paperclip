# DeepSeek-V4 Paperclip Bridge

OpenCode provider configuration for using DeepSeek-V4 with Paperclip via the `@ai-sdk/openai-compatible` adapter.

## Prerequisites

- [OpenCode](https://opencode.ai) installed
- A valid DeepSeek-V4 API key
- Paperclip running locally (no backend code changes required)

## Setup

### 1. Apply the provider configuration

Copy `config-template.json` to your OpenCode config directory:

```bash
mkdir -p ~/.opencode
cp config-template.json ~/.opencode/config.json
```

### 2. Configure Paperclip UI

In Paperclip, create or edit an agent with these settings:

| Field   | Value                |
|---------|----------------------|
| Adapter | OpenCode (local)     |
| Command | opencode             |
| Model   | `deepseek-v4-flash`  |

Use `deepseek-v4-flash` for all Paperclip agents that run multi-turn conversations. See the Known Issues section below before using `deepseek-v4-pro` or `deepseek-reasoner`.

### 3. Secure your API key

Set both `DEEPSEEK_API_KEY` and `OPENAI_API_KEY` to the same DeepSeek key. This is the runtime mapping OpenCode expects for `@ai-sdk/openai-compatible` in current local setups. **Do not** hardcode keys in committed config files.

```bash
# Example: set via your shell profile (do not commit)
export DEEPSEEK_API_KEY="sk-your-key-here"
export OPENAI_API_KEY="$DEEPSEEK_API_KEY"
```

For production use, configure the key through Paperclip's sealed env vars UI rather than plaintext environment variables.

## Models

| Model | Thinking mode | Multi-turn safe | Use for |
|-------|--------------|-----------------|---------|
| `deepseek-v4-flash` | No | **Yes** | All Paperclip agents (default) |
| `deepseek-v4-pro` | Yes | No* | Single-turn tasks only |
| `deepseek-reasoner` | Yes | No* | Single-turn chain-of-thought only |

*See Known Issues below.

## Known Issues

### `reasoning_content` error on multi-turn agents

**Symptom:**
```
adapter_failed - The `reasoning_content` in the thinking mode must be passed back to the API.
```

**Cause:**

`deepseek-v4-pro` and `deepseek-reasoner` run in thinking mode. Each API response includes a `reasoning_content` field containing the model's internal chain-of-thought. The DeepSeek API requires this field to be echoed back verbatim in the `assistant` message of every subsequent turn. If it is missing, the API rejects the request with the error above.

The Paperclip `opencode_local` adapter does not automatically extract and re-attach `reasoning_content` when building the conversation history for the next turn. This means any agent using a thinking model will succeed on turn 1 but fail on turn 2+.

**Fix:**

Switch the agent to `deepseek-v4-flash`. This model does not use thinking mode and has no `reasoning_content` requirement. Update the agent's `adapterConfig` in Paperclip:

```json
{ "adapterConfig": { "model": "deepseek/deepseek-v4-flash" } }
```

Or change `defaultModel` in `~/.opencode/config.json` to `deepseek-v4-flash` to apply the fix to all agents that have not set an explicit model.

**If you need thinking mode:**

Use `deepseek-v4-pro` or `deepseek-reasoner` only for single-turn tasks where the agent completes its work in one invocation and does not continue the session. Alternatively, use a Gemini model (see [gemini-paperclip](https://github.com/meanstackofdoom/gemini-paperclip)), which provides strong reasoning without the `reasoning_content` passback requirement.

### Empty response with `finish_reason: length`

Both thinking models consume internal reasoning tokens before emitting a response. If `max_tokens` is set below ~100, the token budget is exhausted during reasoning and the visible response is empty. The `config-template.json` defaults to `8192` for all models. Do not lower this below `500`.

### 4. Quick validation (no backend changes)

From a project workspace:

```bash
opencode run "Reply with exactly one word: OK" --model deepseek/deepseek-v4-pro --format json
npm run smoke:deepseek
```

Expected:
- OpenCode run returns `OK`
- Smoke script returns `DeepSeek integration OK`

## Security

- The `config-template.json` contains a placeholder API key (`YOUR_DEEPSEEK_API_KEY_HERE`). Replace it through environment variables or sealed project env vars — **never** by editing the committed config file.
- This release is a **sanitized extract**. No internal infrastructure paths, credentials, or Paperclip instance metadata are included.

## Validation Snapshot (2026-04-27)

- Scope: all active non-CEO Edict agents (OpenCode + Codex adapters)
- Result: PASS across connectivity + functional smoke
- Backend changes: none required in `paperclip` backend repo
- Key runtime fix: expose DeepSeek key as `OPENAI_API_KEY` for OpenCode provider compatibility

## Files

| File | Purpose |
|------|---------|
| `config-template.json` | OpenCode provider config for DeepSeek-V4 |
| `README.md` | Setup, model guide, and known issues |
