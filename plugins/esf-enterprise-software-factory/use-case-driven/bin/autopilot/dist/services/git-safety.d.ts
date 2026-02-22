/**
 * Check for uncommitted changes in the working tree
 */
export declare function hasUncommittedChanges(cwd: string): Promise<boolean>;
/**
 * Get list of uncommitted files
 */
export declare function getUncommittedFiles(cwd: string): Promise<string[]>;
/**
 * Create a safety commit for orphaned files
 */
export declare function createSafetyCommit(cwd: string, context: string): Promise<boolean>;
/**
 * Ensure the working tree is clean, creating a safety commit if needed
 */
export declare function ensureCleanWorkingTree(cwd: string, context: string, logger?: (level: string, message: string) => void): Promise<{
    wasClean: boolean;
    commitCreated: boolean;
}>;
/**
 * Get current branch name
 */
export declare function getCurrentBranch(cwd: string): Promise<string | null>;
/**
 * Check if we're in a git repository
 */
export declare function isGitRepository(cwd: string): Promise<boolean>;
/**
 * Get the latest commit hash
 */
export declare function getLatestCommit(cwd: string): Promise<string | null>;
/**
 * Get commit count since a specific commit
 */
export declare function getCommitsSince(cwd: string, since: string): Promise<number>;
//# sourceMappingURL=git-safety.d.ts.map