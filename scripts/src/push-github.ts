import { ReplitConnectors } from '@replit/connectors-sdk';
import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const OWNER  = 'kalidevelopedit';
const REPO   = 'mail-switcher';
const BRANCH = 'main';

// Tracks the last local commit SHA we successfully pushed.
// Needed because GitHub's Git Data API creates commits with different SHAs
// from local ones, so after the first push the remote HEAD won't exist locally.
const SYNC_FILE = path.join('.git', 'github-push-head');

function getLastLocalSha(): string | null {
  try { return readFileSync(SYNC_FILE, 'utf8').trim() || null; } catch { return null; }
}

function saveLastLocalSha(sha: string): void {
  try { writeFileSync(SYNC_FILE, sha + '\n', 'utf8'); } catch { /* ignore */ }
}

type ProxyFetch = (input: string | URL, init?: RequestInit) => Promise<Response>;

// ─── git helpers (local, no network) ────────────────────────────────────────

function git(...args: string[]): string {
  const r = spawnSync('git', args, { cwd: getRepoRoot(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.status !== 0) throw new Error(`git ${args[0]} failed: ${r.stderr?.trim()}`);
  return r.stdout.trim();
}

function gitBuffer(...args: string[]): Buffer {
  const r = spawnSync('git', args, { cwd: getRepoRoot(), encoding: 'buffer', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 50 * 1024 * 1024 });
  if (r.status !== 0 || r.error) throw new Error(`git ${args[0]} failed: ${r.stderr?.toString().trim() || r.error?.message || ''}`);
  return r.stdout as Buffer;
}

interface CommitInfo {
  sha: string;
  treeSha: string;
  parents: string[];
  authorName: string;
  authorEmail: string;
  authorDate: string;
  committerName: string;
  committerEmail: string;
  committerDate: string;
  message: string;
}

function parseCommits(range: string): CommitInfo[] {
  // Use a text separator — null bytes are rejected by Node.js spawnSync
  const SEP = '<<<COMMIT_SEP>>>';
  const raw = git('log', '--format=%H%n%T%n%P%n%an%n%ae%n%aI%n%cn%n%ce%n%cI%n%B' + SEP, range);
  if (!raw) return [];
  return raw.split(SEP).map(s => s.trim()).filter(Boolean).map(block => {
    const lines = block.split('\n');
    const [sha, treeSha, parentsLine, authorName, authorEmail, authorDate,
           committerName, committerEmail, committerDate, ...msgLines] = lines;
    return {
      sha: sha!.trim(),
      treeSha: treeSha!.trim(),
      parents: parentsLine!.trim() ? parentsLine!.trim().split(' ') : [],
      authorName: authorName!.trim(),
      authorEmail: authorEmail!.trim(),
      authorDate: authorDate!.trim(),
      committerName: committerName!.trim(),
      committerEmail: committerEmail!.trim(),
      committerDate: committerDate!.trim(),
      message: msgLines.join('\n').trim(),
    };
  });
}

interface ChangedFile {
  status: 'A' | 'M' | 'D' | 'R' | 'C';
  oldPath?: string;
  path: string;
  /** New file mode from git (e.g. "100644", "100755"). Empty string means deleted. */
  newMode: string;
}

function getChangedFiles(commitSha: string): ChangedFile[] {
  // --raw gives: :<old-mode> <new-mode> <old-sha> <new-sha> <status>\t<path>
  // For renames:  :<old-mode> <new-mode> <old-sha> <new-sha> R<score>\t<old>\t<new>
  const r = spawnSync('git', ['diff-tree', '--no-commit-id', '-r', '--raw', '-M', commitSha],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if ((r.status ?? 0) !== 0) return [];
  return r.stdout.trim().split('\n').filter(Boolean).map(line => {
    // Strip leading ':'
    const rest = line.startsWith(':') ? line.slice(1) : line;
    const [meta, ...pathParts] = rest.split('\t');
    const fields = (meta ?? '').split(' ');
    // fields: [old-mode, new-mode, old-sha, new-sha, status]
    const newMode = fields[1] ?? '100644';
    const statusStr = fields[4] ?? 'M';
    const statusChar = statusStr.charAt(0) as 'A' | 'M' | 'D' | 'R' | 'C';
    if ((statusChar === 'R' || statusChar === 'C') && pathParts.length >= 2) {
      return { status: statusChar, oldPath: pathParts[0], path: pathParts[1]!, newMode };
    }
    return { status: statusChar, path: pathParts[0]!, newMode };
  });
}

// ─── GitHub Git Data API ─────────────────────────────────────────────────────

const GH_API = 'https://api.github.com';

async function ghPost(proxyFetch: ProxyFetch, path: string, body: unknown): Promise<unknown> {
  const res = await proxyFetch(`${GH_API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function ghPatch(proxyFetch: ProxyFetch, path: string, body: unknown): Promise<Response> {
  const res = await proxyFetch(`${GH_API}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
    body: JSON.stringify(body),
  });
  return res;
}

async function createBlob(proxyFetch: ProxyFetch, content: Buffer): Promise<string> {
  const data = await ghPost(proxyFetch, `/repos/${OWNER}/${REPO}/git/blobs`, {
    content: content.toString('base64'),
    encoding: 'base64',
  }) as { sha: string };
  return data.sha;
}

async function createTree(
  proxyFetch: ProxyFetch,
  baseTreeSha: string,
  treeItems: Array<{ path: string; mode: string; type: string; sha: string | null }>,
): Promise<string> {
  const data = await ghPost(proxyFetch, `/repos/${OWNER}/${REPO}/git/trees`, {
    base_tree: baseTreeSha,
    tree: treeItems,
  }) as { sha: string };
  return data.sha;
}

async function createCommit(
  proxyFetch: ProxyFetch,
  info: CommitInfo,
  treeSha: string,
  parentShas: string[],
): Promise<string> {
  const data = await ghPost(proxyFetch, `/repos/${OWNER}/${REPO}/git/commits`, {
    message: info.message,
    tree: treeSha,
    parents: parentShas,
    author:    { name: info.authorName,    email: info.authorEmail,    date: info.authorDate },
    committer: { name: info.committerName, email: info.committerEmail, date: info.committerDate },
  }) as { sha: string };
  return data.sha;
}

// ─── Uncommitted working-tree helpers ────────────────────────────────────────

interface WorkingTreeFile {
  path: string;
  deleted: boolean;
}

function getRepoRoot(): string {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return r.stdout.trim();
}

function getUncommittedFiles(): WorkingTreeFile[] {
  const root = getRepoRoot();
  const abs = (p: string) => path.join(root, p);

  // Modified/deleted vs HEAD (staged + unstaged)
  const diffResult = spawnSync(
    'git', ['diff', 'HEAD', '--name-status', '-z'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const results: WorkingTreeFile[] = [];
  if ((diffResult.status ?? 1) === 0 && diffResult.stdout) {
    const entries = diffResult.stdout.split('\0').filter(Boolean);
    for (let i = 0; i < entries.length; i += 2) {
      const status = (entries[i] ?? '').trim();
      const filePath = (entries[i + 1] ?? '').trim();
      if (!filePath) continue;
      if (status.startsWith('D')) {
        results.push({ path: filePath, deleted: true });
      } else if (status.startsWith('M') || status.startsWith('A')) {
        if (existsSync(abs(filePath))) results.push({ path: filePath, deleted: false });
      }
    }
  }
  // Untracked files
  const untrackedResult = spawnSync(
    'git', ['ls-files', '--others', '--exclude-standard', '-z'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  if ((untrackedResult.status ?? 1) === 0 && untrackedResult.stdout) {
    untrackedResult.stdout.split('\0').filter(Boolean).forEach(p => {
      if (existsSync(abs(p))) results.push({ path: p, deleted: false });
    });
  }
  return results;
}

// ─── Main push logic ─────────────────────────────────────────────────────────

async function getRemoteHeadSha(proxyFetch: ProxyFetch): Promise<string> {
  const res = await proxyFetch(`${GH_API}/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`, {
    headers: { 'X-GitHub-Api-Version': '2022-11-28' },
  });
  if (!res.ok) throw new Error(`Could not get remote HEAD: ${res.status} ${await res.text()}`);
  const data = await res.json() as { object: { sha: string } };
  return data.object.sha;
}

async function getRemoteTreeSha(proxyFetch: ProxyFetch, commitSha: string): Promise<string> {
  const res = await proxyFetch(`${GH_API}/repos/${OWNER}/${REPO}/git/commits/${commitSha}`, {
    headers: { 'X-GitHub-Api-Version': '2022-11-28' },
  });
  if (!res.ok) throw new Error(`Could not get remote commit: ${res.status}`);
  const data = await res.json() as { tree: { sha: string } };
  return data.tree.sha;
}

async function tryPush(proxyFetch: ProxyFetch): Promise<{ ok: boolean; output: string }> {
  if (git('status', '--porcelain')) {
    throw new Error('Commit all project changes before pushing; the working tree is not clean.');
  }
  const localHead = git('rev-parse', 'HEAD');
  const remoteHead = await getRemoteHeadSha(proxyFetch);
  const baseTreeSha = await getRemoteTreeSha(proxyFetch, remoteHead);
  const remoteTreeRes = await proxyFetch(
    `${GH_API}/repos/${OWNER}/${REPO}/git/trees/${baseTreeSha}?recursive=1`,
    { headers: { 'X-GitHub-Api-Version': '2022-11-28' } },
  );
  if (!remoteTreeRes.ok) throw new Error(`Could not list remote files: ${remoteTreeRes.status}`);
  const remoteTree = await remoteTreeRes.json() as {
    truncated: boolean;
    tree: Array<{ path: string; mode: string; type: string; sha: string }>;
  };
  if (remoteTree.truncated) throw new Error('Remote file list was truncated; refusing incomplete sync.');
  const remoteFiles = new Map(remoteTree.tree
    .filter(item => item.type !== 'tree')
    .map(item => [item.path, item]));

  // Sync the full committed project tree, not only commits since the last push.
  // This also picks up images/assets omitted by older versions of this workflow.
  const localFiles = git('ls-files', '-s', '-z').split('\0').filter(Boolean).map(line => {
    const tab = line.indexOf('\t');
    const [mode, sha] = line.slice(0, tab).split(' ');
    return { path: line.slice(tab + 1), mode: mode!, sha: sha! };
  });
  const treeItems: Array<{ path: string; mode: string; type: string; sha: string | null }> = [];
  for (const file of localFiles) {
    const remote = remoteFiles.get(file.path);
    remoteFiles.delete(file.path);
    if (remote?.sha === file.sha && remote.mode === file.mode) continue;
    if (file.mode === '160000') throw new Error(`Submodule unsupported: ${file.path}`);
    const blobSha = await createBlob(proxyFetch, gitBuffer('show', `${localHead}:${file.path}`));
    treeItems.push({ path: file.path, mode: file.mode, type: 'blob', sha: blobSha });
  }
  for (const file of remoteFiles.values()) {
    treeItems.push({ path: file.path, mode: file.mode, type: file.type, sha: null });
  }
  if (!treeItems.length) {
    saveLastLocalSha(localHead);
    return { ok: true, output: 'Remote file tree already matches the complete local project.\n' };
  }
  console.log(`  Syncing ${treeItems.length} added/changed/removed paths (including assets)…`);
  const newTreeSha = await createTree(proxyFetch, baseTreeSha, treeItems);
  const now = new Date().toISOString();
  const newCommitSha = await createCommit(proxyFetch, {
    sha: localHead, treeSha: newTreeSha, parents: [remoteHead],
    authorName: 'Replit Agent', authorEmail: 'agent@replit.com', authorDate: now,
    committerName: 'Replit Agent', committerEmail: 'agent@replit.com', committerDate: now,
    message: git('log', '-1', '--format=%s'),
  }, newTreeSha, [remoteHead]);
  const updateRes = await ghPatch(proxyFetch, `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    sha: newCommitSha,
  });
  if (!updateRes.ok) {
    const text = await updateRes.text();
    return { ok: false, output: `Failed to update ref: ${updateRes.status}: ${text}` };
  }
  const verifiedHead = await getRemoteHeadSha(proxyFetch);
  if (verifiedHead !== newCommitSha) throw new Error('GitHub branch HEAD changed during verification.');
  const verifiedTreeSha = await getRemoteTreeSha(proxyFetch, verifiedHead);
  if (verifiedTreeSha !== newTreeSha) throw new Error('GitHub branch tree does not match the committed project.');
  const verifiedTreeRes = await proxyFetch(
    `${GH_API}/repos/${OWNER}/${REPO}/git/trees/${verifiedTreeSha}?recursive=1`,
    { headers: { 'X-GitHub-Api-Version': '2022-11-28' } },
  );
  if (!verifiedTreeRes.ok) throw new Error(`Could not verify remote files: ${verifiedTreeRes.status}`);
  const verifiedTree = await verifiedTreeRes.json() as {
    truncated: boolean;
    tree: Array<{ path: string; mode: string; type: string; sha: string }>;
  };
  const verifiedFiles = verifiedTree.tree.filter(item => item.type !== 'tree');
  const localByPath = new Map(localFiles.map(file => [file.path, file]));
  if (verifiedTree.truncated || verifiedFiles.length !== localFiles.length ||
    verifiedFiles.some(file => {
      const local = localByPath.get(file.path);
      return !local || local.sha !== file.sha || local.mode !== file.mode;
    })) {
    throw new Error('Remote file verification failed: GitHub does not match the local commit.');
  }
  saveLastLocalSha(localHead);
  return { ok: true, output: `  Created ${newCommitSha.slice(0, 7)}; verified ${verifiedFiles.length} files match the committed project.\n` };
}

async function main() {
  console.log('🔗  Initializing GitHub connector…');
  const connectors = new ReplitConnectors();

  // Use the connector proxy for authenticated GitHub REST API calls.
  // This bypasses the system git binary (which Replit's LD hooks intercept) and
  // the stale GITHUB_TOKEN_OAUTH env var, using the live connector credentials instead.
  const proxyFetch = connectors.createProxyFetch('github');

  console.log(`📤  Pushing HEAD → ${BRANCH} on github.com/${OWNER}/${REPO} …`);

  const { ok, output } = await tryPush(proxyFetch);

  if (!ok) {
    throw new Error(`Push failed:\n${output}`);
  }

  process.stdout.write(output);
  console.log('✅  Push complete!');
}

main().catch(err => {
  console.error('❌ ', err.message);
  process.exit(1);
});
