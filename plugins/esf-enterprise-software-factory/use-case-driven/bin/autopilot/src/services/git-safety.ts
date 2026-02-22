import { spawn } from 'node:child_process';

/**
 * Execute a git command and return the output
 */
async function git(
  args: string[],
  cwd: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const proc = spawn('git', args, { cwd, stdio: 'pipe' });
    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code ?? 1,
      });
    });

    proc.on('error', () => {
      resolve({ stdout: '', stderr: 'Git command failed', exitCode: 1 });
    });
  });
}

/**
 * Check for uncommitted changes in the working tree
 */
export async function hasUncommittedChanges(cwd: string): Promise<boolean> {
  const diffResult = await git(['diff', '--quiet', 'HEAD'], cwd);
  const cachedResult = await git(['diff', '--cached', '--quiet'], cwd);

  return diffResult.exitCode !== 0 || cachedResult.exitCode !== 0;
}

/**
 * Get list of uncommitted files
 */
export async function getUncommittedFiles(cwd: string): Promise<string[]> {
  const result = await git(['status', '--short'], cwd);
  if (!result.stdout) return [];

  return result.stdout
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => line.slice(3)); // Remove status prefix
}

/**
 * Create a safety commit for orphaned files
 */
export async function createSafetyCommit(
  cwd: string,
  context: string
): Promise<boolean> {
  // Stage all changes
  const addResult = await git(['add', '-A'], cwd);
  if (addResult.exitCode !== 0) return false;

  // Create commit
  const message = `wip(autopilot): uncommitted files from ${context}

Autopilot detected uncommitted files that would otherwise be lost.
Review and squash/revert as appropriate.`;

  const commitResult = await git(['commit', '-m', message], cwd);
  return commitResult.exitCode === 0;
}

/**
 * Ensure the working tree is clean, creating a safety commit if needed
 */
export async function ensureCleanWorkingTree(
  cwd: string,
  context: string,
  logger?: (level: string, message: string) => void
): Promise<{ wasClean: boolean; commitCreated: boolean }> {
  const hasChanges = await hasUncommittedChanges(cwd);

  if (!hasChanges) {
    return { wasClean: true, commitCreated: false };
  }

  // Log warning
  const files = await getUncommittedFiles(cwd);
  logger?.('WARN', `Uncommitted files detected (${context})`);
  logger?.('WARN', files.join(', '));

  // Create safety commit
  const committed = await createSafetyCommit(cwd, context);

  if (committed) {
    logger?.('INFO', 'Created safety commit for orphaned files');
  } else {
    logger?.('ERROR', 'Failed to create safety commit');
  }

  return { wasClean: false, commitCreated: committed };
}

/**
 * Get current branch name
 */
export async function getCurrentBranch(cwd: string): Promise<string | null> {
  const result = await git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
  if (result.exitCode !== 0) return null;
  return result.stdout;
}

/**
 * Check if we're in a git repository
 */
export async function isGitRepository(cwd: string): Promise<boolean> {
  const result = await git(['rev-parse', '--is-inside-work-tree'], cwd);
  return result.exitCode === 0 && result.stdout === 'true';
}

/**
 * Get the latest commit hash
 */
export async function getLatestCommit(cwd: string): Promise<string | null> {
  const result = await git(['rev-parse', 'HEAD'], cwd);
  if (result.exitCode !== 0) return null;
  return result.stdout;
}

/**
 * Get commit count since a specific commit
 */
export async function getCommitsSince(
  cwd: string,
  since: string
): Promise<number> {
  const result = await git(['rev-list', '--count', `${since}..HEAD`], cwd);
  if (result.exitCode !== 0) return 0;
  return parseInt(result.stdout, 10) || 0;
}
