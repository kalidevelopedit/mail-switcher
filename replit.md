# AuthStudio

This repository is a pnpm workspace containing the AuthStudio web app, its API server, the design preview, shared libraries, and the source assets.

## Importing into Replit

1. Import the repository and install dependencies with `pnpm install --frozen-lockfile`.
2. Start the artifact-managed `artifacts/api-server: API Server` and `artifacts/auth-studio: web` services. Their manifests under `artifacts/*/.replit-artifact/` define paths, ports, and production builds.
3. Configure `SESSION_SECRET` as a Replit Secret for a new installation. Set `ADMIN_PASSCODE` as a Replit Secret if the admin dashboard needs passcode protection. Never commit secret values.
4. If you want to use the optional Push to GitHub workflow in the imported project, connect its GitHub integration and review the repository target in `scripts/src/push-github.ts`.

The tracked `pnpm-lock.yaml` and package manifests specify dependencies; generated `node_modules`, `dist`, and TypeScript build caches are recreated locally. Visitor sessions, captured form data, and visit history are runtime data and intentionally are not part of the source repository. A new import starts with no visitor records.

## Useful commands

- `pnpm run typecheck` — check all workspace packages
- `pnpm --filter @workspace/api-server run dev` — API server (managed workflow provides `PORT`)
- `pnpm --filter @workspace/auth-studio run dev` — Vite web app
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API clients if the API contract changes