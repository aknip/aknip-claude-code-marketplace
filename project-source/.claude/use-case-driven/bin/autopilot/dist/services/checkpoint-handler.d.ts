import type { Checkpoint, DerivedPaths } from '../types/config.js';
/**
 * Queue a checkpoint for later review
 */
export declare function queueCheckpoint(paths: DerivedPaths, checkpoint: Omit<Checkpoint, 'id' | 'createdAt' | 'status'>): Promise<Checkpoint>;
/**
 * Get all pending checkpoints
 */
export declare function getPendingCheckpoints(paths: DerivedPaths): Promise<Checkpoint[]>;
/**
 * Get all approved checkpoints
 */
export declare function getApprovedCheckpoints(paths: DerivedPaths): Promise<Checkpoint[]>;
/**
 * Approve a checkpoint
 */
export declare function approveCheckpoint(paths: DerivedPaths, checkpointId: string, response?: string): Promise<void>;
/**
 * Reject a checkpoint
 */
export declare function rejectCheckpoint(paths: DerivedPaths, checkpointId: string, response?: string): Promise<void>;
/**
 * Process an approved checkpoint and move to processed
 */
export declare function markCheckpointProcessed(paths: DerivedPaths, checkpointId: string): Promise<void>;
/**
 * Get checkpoint count by status
 */
export declare function getCheckpointCounts(paths: DerivedPaths): Promise<{
    pending: number;
    approved: number;
    processed: number;
}>;
/**
 * Clear all checkpoints (for cleanup)
 */
export declare function clearAllCheckpoints(paths: DerivedPaths, keepProcessed?: boolean): Promise<void>;
//# sourceMappingURL=checkpoint-handler.d.ts.map