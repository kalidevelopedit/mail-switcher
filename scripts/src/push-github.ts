import { ReplitConnectors } from '@replit/connectors-sdk';
import { execSync } from 'child_process';

const OWNER = 'kalidevelopedit';
const REPO  = 'mail-switcher';
const BRANCH = 'main';

async function getGithubToken(): Promise<string> {
  // Check both token env var names
  const envToken = process.env['GITHUB_TOKEN'] ?? process.env['GITHUB_TOKEN_OAUTH'];
  if (envToken) return envToken;

  const connectors = new ReplitConnectors();
  // Fetch with default expand; dump shape on failure for debugging
  const connections = await connectors.listConnections({ connector_names: 'github' });
  if (!connections.length) {
    throw new Error('No GitHub connection found — reconnect the GitHub integration in Replit.');
  }

  const conn = connections[0] as Record<string, unknown>;

  // Walk all top-level keys looking for an OAuth access token
  for (const key of Object.keys(conn)) {
    const val = conn[key];
    if (val && typeof val === 'object') {
      const nested = val as Record<string, unknown>;
      if (typeof nested['access_token'] === 'string') return nested['access_token'];
      if (typeof nested['token'] === 'string')         return nested['token'];
    }
    if (typeof val === 'string' && key.toLowerCase().includes('token')) return val;
  }

  // Debug: log top-level keys (not values) to help diagnose
  const shape: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(conn)) {
    if (v === null || v === undefined) { shape[k] = String(v); }
    else if (typeof v === 'object') { shape[k] = Object.keys(v as object); }
    else if (typeof v === 'string' && v.length > 6) { shape[k] = `string(${v.length})`; }
    else { shape[k] = v; }
  }
  console.error('Connection shape:', JSON.stringify(shape, null, 2));

  throw new Error(
    'Could not find a GitHub access token in the connection object.\n' +
    'Add a GITHUB_TOKEN secret in Replit Secrets with a Personal Access Token from https://github.com/settings/tokens'
  );
}

async function main() {
  console.log('🔑  Fetching GitHub token…');
  const token = await getGithubToken();
  const remote = `https://${OWNER}:${token}@github.com/${OWNER}/${REPO}.git`;

  console.log(`📤  Pushing HEAD → ${BRANCH} on github.com/${OWNER}/${REPO} …`);
  execSync(`git push "${remote}" HEAD:${BRANCH}`, { stdio: 'inherit' });
  console.log('✅  Push complete!');
}

main().catch(err => {
  console.error('❌ ', err.message);
  process.exit(1);
});
