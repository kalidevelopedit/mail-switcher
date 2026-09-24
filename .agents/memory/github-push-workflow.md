---
name: GitHub push from workflow
description: Why the connected-account push uses GitHub's API, and what to audit before backing up a full Replit project.
---

Use the connected GitHub proxy rather than system git for network pushes from a workflow. Local git is fine for committing and reading blobs.

**Why:** Replit workflow network/credential handling can break ordinary git HTTPS pushes, while the connector proxy uses the live account connection. Past partial pushes omitted assets and could replay unsafe historic data.

**How to apply:** Keep push behavior a complete comparison between the remote tree and the committed local tree, including assets and deletions. Exclude live runtime records and secrets from git tracking before committing. Never bypass GitHub secret-scanning protection. A clean current tree does not erase secrets already present in historical GitHub commits; address historical exposure separately.