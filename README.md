# DeepSeek-V4 Paperclip Bridge

OpenCode provider configuration for using DeepSeek-V4 with Paperclip via the `@ai-sdk/openai-compatible` adapter.

## Prerequisites

- [OpenCode](https://opencode.ai) installed
- A valid DeepSeek-V4 API key

## Setup

### 1. Apply the provider configuration

Copy `config-template.json` to your OpenCode config directory:

```bash
mkdir -p ~/.opencode
cp config-template.json ~/.opencode/config.json
```

### 2. Configure Paperclip UI

In Paperclip, create or edit an agent with these settings:

| Field       | Value                        |
|-------------|------------------------------|
| Adapter     | OpenCode (local)             |
| Command     | opencode                     |
| Model       | deepseek-v4-pro              |

### 3. Secure your API key

Set the `DEEPSEEK_API_KEY` environment variable using sealed environment variables in your Paperclip project settings. **Do not** hardcode the key in any config file or commit it to version control.

```bash
# Example: set via your shell profile (do not commit)
export DEEPSEEK_API_KEY="sk-your-key-here"
```

For production use, configure the key through Paperclip's sealed env vars UI rather than plaintext environment variables.

## Security

- The `config-template.json` contains a placeholder API key (`YOUR_DEEPSEEK_API_KEY_HERE`). Replace it with your actual key through environment variables or sealed project env vars — **never** by editing the committed config file.
- This release is a **sanitized extract**. No internal infrastructure paths, credentials, or Paperclip instance metadata are included. Zero secrets leaked.

## Files

| File               | Purpose                                         |
|--------------------|-------------------------------------------------|
| `config-template.json` | OpenCode provider config for DeepSeek-V4    |
| `README.md`        | Setup and security guide                        |
