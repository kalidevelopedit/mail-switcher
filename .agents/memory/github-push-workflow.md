---
name: GitHub push from workflow
description: Why system git fails for push in Replit workflows, what actually works, and how to handle the SHA divergence problem.
---

## The rule
Use `ReplitConnectors.createProxyFetch('github')` + the GitHub Git Data API (blobs → trees → commits → PATCH ref) to push. Never spawn the system `git` binary for network operations from a workflow script.

**Why:** Three layered blockers prevent system git from pushing in Replit workflow scripts:
1. `GITHUB_TOKEN_OAUTH` env var is baked in at workflow-start time and goes stale when Replit rotates the OAuth token.
2. `ReplitConnectors.listConnections()` returns connection metadata only — no `settings.access_token` in the workflow context (valid expand values are only `connector` and `toon_schema`).
3. Replit's LD_AUDIT hooks intercept libcurl HTTPS traffic and strip custom `Authorization` headers (via `http.extraheader`). Even isomorphic-git (pure-JS HTTP) is rejected because it uses the same stale token.
4. `replit-git-askpass` provides the username automatically but hangs waiting for terminal input on the password prompt — it cannot run non-interactively from a subprocess.

**How to apply:** In `scripts/src/push-github.ts`:
- Call `connectors.createProxyFetch('github')` — this routes REST API calls through Replit's connector proxy which injects live credentials automatically.
- Use the GitHub Git Data API: for each local commit ahead of remote, create blobs for changed files, create a new tree from the parent tree + new blobs, create a commit object, then PATCH the branch ref.
- Local git commands (git log, git diff-tree, git show, git ls-tree) are fine — only network operations break.
- The connector proxy base URL for GitHub is `https://api.github.com` (REST), NOT `https://github.com` (git protocol). Git protocol calls through the proxy do not work.

## SHA divergence problem (critical)

**Why it happens:** The GitHub Git Data API creates commits with different SHAs from local ones. After the first push, the remote HEAD SHA doesn't exist in the local git history. The next push attempt runs `git log remoteHead..HEAD` which fails with `Invalid revision range`.

**Fix:** Track the last local commit SHA in `.git/github-push-head` (a plain text file). On each push:
1. Check if `remoteHead` exists locally via `git cat-file -e remoteHead`.
2. If yes: use `remoteHead..HEAD` as normal.
3. If no: read `.git/github-push-head` for the last locally-pushed SHA; use `lastLocal..HEAD` if that exists locally.
4. If no tracking file either: fall back to `HEAD~1..HEAD` (snapshot of the latest commit only).
5. After a successful push: write local HEAD to `.git/github-push-head`.

**Why it matters:** Without this fix, every push after the first one fails permanently because the remote's API-created commits never appear in the local git history.
