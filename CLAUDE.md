# DeepSeek-Paperclip Bridge -- Agent Rules

## Canonical Location

This repository MUST be kept in sync at:

```
C:\Users\controller\Desktop\deepseek-paperclip
```

This is the board-mandated source of truth for all DeepSeek-Paperclip configuration.

## Sync Rules (Mandatory)

1. **Any change to DeepSeek provider config, model settings, or adapter configuration MUST be committed and pushed to this repo AND pulled to the canonical local path above.**
2. When modifying `config-template.json`, `README.md`, or adding new config files, always:
   - Make the change in this repo
   - Commit and push to `https://github.com/meanstackofdoom/deepseek-paperclip`
   - Ensure `C:\Users\controller\Desktop\deepseek-paperclip` reflects the latest state (`git pull`)
3. When Paperclip agent adapter settings for DeepSeek/OpenCode agents change (model name, base URL, provider config), update `config-template.json` in this repo to match.
4. Never leave the local desktop copy out of date. If in doubt, run `git pull` in the canonical path before and after any related work.

## Upload Isolation (Mandatory)

This project uploads ONLY to `https://github.com/meanstackofdoom/deepseek-paperclip`. No exceptions.

1. **Single-remote rule**: The only permitted `git push` target from this working directory is `origin` → `https://github.com/meanstackofdoom/deepseek-paperclip`. Agents MUST NOT add additional remotes, push to other repositories, or create PRs against any other GitHub repo from this tree.
2. **No cross-repo pushes**: If an agent is working in this directory and also has tasks in other repos (e.g., the main Paperclip company repo, other project repos), it MUST NOT push files from this repo to those remotes, and MUST NOT push files from those repos to this remote.
3. **Content boundary**: Only files that belong to the DeepSeek-Paperclip bridge (config templates, adapter docs, bridge utilities) may be committed here. Company-internal agent configs, Paperclip platform code, or unrelated project files MUST NOT be added to this repo.
4. **Credential scope**: The GitHub credentials used for this repo are scoped to the deepseek-paperclip project. Do not reuse or reference them for other repositories.
5. **Verification before push**: Before any `git push`, agents MUST run `git remote -v` and confirm the push URL is exactly `https://github.com/meanstackofdoom/deepseek-paperclip`. If it is not, abort and report.

## Security

- Never commit real API keys. Use `YOUR_DEEPSEEK_API_KEY_HERE` placeholder in config files.
- API keys go in sealed env vars or shell profiles, never in version control.

## Scope

This applies to all agents in the HOL company that touch DeepSeek configuration:
- CTO (opencode_local / deepseek-reasoner)
- Security Auditor (opencode_local / deepseek-v4-pro)
- Any future agents using the DeepSeek provider
