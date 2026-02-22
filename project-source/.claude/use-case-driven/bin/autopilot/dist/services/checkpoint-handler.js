import fs from 'fs-extra';
import path from 'node:path';
/**
 * Create a unique checkpoint ID
 */
function createCheckpointId(phase, plan) {
    const timestamp = Date.now().toString(36);
    const planStr = plan !== undefined ? `-plan-${plan}` : '';
    return `phase-${phase}${planStr}-${timestamp}`;
}
/**
 * Queue a checkpoint for later review
 */
export async function queueCheckpoint(paths, checkpoint) {
    const id = createCheckpointId(checkpoint.phase, checkpoint.plan);
    const fullCheckpoint = {
        ...checkpoint,
        id,
        createdAt: new Date(),
        status: 'pending',
    };
    const pendingDir = path.join(paths.checkpointDir, 'pending');
    await fs.ensureDir(pendingDir);
    const filename = `${id}.json`;
    const filepath = path.join(pendingDir, filename);
    await fs.writeJSON(filepath, fullCheckpoint, { spaces: 2 });
    return fullCheckpoint;
}
/**
 * Get all pending checkpoints
 */
export async function getPendingCheckpoints(paths) {
    const pendingDir = path.join(paths.checkpointDir, 'pending');
    try {
        await fs.ensureDir(pendingDir);
        const files = await fs.readdir(pendingDir);
        const checkpoints = [];
        for (const file of files) {
            if (!file.endsWith('.json'))
                continue;
            const filepath = path.join(pendingDir, file);
            const checkpoint = await fs.readJSON(filepath);
            checkpoints.push(checkpoint);
        }
        return checkpoints.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    catch {
        return [];
    }
}
/**
 * Get all approved checkpoints
 */
export async function getApprovedCheckpoints(paths) {
    const approvedDir = path.join(paths.checkpointDir, 'approved');
    try {
        await fs.ensureDir(approvedDir);
        const files = await fs.readdir(approvedDir);
        const checkpoints = [];
        for (const file of files) {
            if (!file.endsWith('.json'))
                continue;
            const filepath = path.join(approvedDir, file);
            const checkpoint = await fs.readJSON(filepath);
            checkpoints.push(checkpoint);
        }
        return checkpoints.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    catch {
        return [];
    }
}
/**
 * Approve a checkpoint
 */
export async function approveCheckpoint(paths, checkpointId, response) {
    const pendingPath = path.join(paths.checkpointDir, 'pending', `${checkpointId}.json`);
    const approvedDir = path.join(paths.checkpointDir, 'approved');
    const approvedPath = path.join(approvedDir, `${checkpointId}.json`);
    await fs.ensureDir(approvedDir);
    const checkpoint = await fs.readJSON(pendingPath);
    checkpoint.status = 'approved';
    checkpoint.response = response;
    await fs.writeJSON(approvedPath, checkpoint, { spaces: 2 });
    await fs.remove(pendingPath);
}
/**
 * Reject a checkpoint
 */
export async function rejectCheckpoint(paths, checkpointId, response) {
    const pendingPath = path.join(paths.checkpointDir, 'pending', `${checkpointId}.json`);
    const processedDir = path.join(paths.checkpointDir, 'processed');
    const processedPath = path.join(processedDir, `${checkpointId}.json`);
    await fs.ensureDir(processedDir);
    const checkpoint = await fs.readJSON(pendingPath);
    checkpoint.status = 'rejected';
    checkpoint.response = response;
    await fs.writeJSON(processedPath, checkpoint, { spaces: 2 });
    await fs.remove(pendingPath);
}
/**
 * Process an approved checkpoint and move to processed
 */
export async function markCheckpointProcessed(paths, checkpointId) {
    const approvedPath = path.join(paths.checkpointDir, 'approved', `${checkpointId}.json`);
    const processedDir = path.join(paths.checkpointDir, 'processed');
    const processedPath = path.join(processedDir, `${checkpointId}.json`);
    await fs.ensureDir(processedDir);
    await fs.move(approvedPath, processedPath);
}
/**
 * Get checkpoint count by status
 */
export async function getCheckpointCounts(paths) {
    const countFiles = async (dir) => {
        try {
            await fs.ensureDir(dir);
            const files = await fs.readdir(dir);
            return files.filter((f) => f.endsWith('.json')).length;
        }
        catch {
            return 0;
        }
    };
    return {
        pending: await countFiles(path.join(paths.checkpointDir, 'pending')),
        approved: await countFiles(path.join(paths.checkpointDir, 'approved')),
        processed: await countFiles(path.join(paths.checkpointDir, 'processed')),
    };
}
/**
 * Clear all checkpoints (for cleanup)
 */
export async function clearAllCheckpoints(paths, keepProcessed = true) {
    await fs.emptyDir(path.join(paths.checkpointDir, 'pending'));
    await fs.emptyDir(path.join(paths.checkpointDir, 'approved'));
    if (!keepProcessed) {
        await fs.emptyDir(path.join(paths.checkpointDir, 'processed'));
    }
}
//# sourceMappingURL=checkpoint-handler.js.map