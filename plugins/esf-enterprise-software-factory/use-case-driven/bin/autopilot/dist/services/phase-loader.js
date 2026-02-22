import fs from 'fs-extra';
import path from 'node:path';
/**
 * Load phase information from ROADMAP.md
 */
export async function loadPhaseInfo(paths, phase) {
    const roadmapFile = paths.roadmapFile;
    if (!await fs.pathExists(roadmapFile)) {
        return {
            number: phase,
            name: `Phase ${phase}`,
            deliverables: [],
            useCases: [],
        };
    }
    const content = await fs.readFile(roadmapFile, 'utf-8');
    return parsePhaseFromRoadmap(content, phase);
}
/**
 * Parse a single phase from ROADMAP.md content
 */
function parsePhaseFromRoadmap(content, phase) {
    const lines = content.split('\n');
    let inPhase = false;
    let name = `Phase ${phase}`;
    let goal;
    const deliverables = [];
    const useCases = [];
    for (const line of lines) {
        // Check for phase header (e.g., "### Phase 1: Setup" or "## Phase 1:")
        const phaseMatch = line.match(/^#+\s*Phase\s+(\d+):?\s*(.*)/i);
        if (phaseMatch) {
            const phaseNum = parseInt(phaseMatch[1], 10);
            if (phaseNum === phase) {
                inPhase = true;
                name = phaseMatch[2]?.trim().replace(/\*+/g, '') || `Phase ${phase}`;
                continue;
            }
            else if (inPhase) {
                // We've reached the next phase, stop
                break;
            }
        }
        if (inPhase) {
            // Extract goal
            if (line.includes('Goal:')) {
                goal = line.replace(/.*Goal:\s*/i, '').replace(/\*+/g, '').trim();
            }
            // Extract deliverables (bullet points)
            const bulletMatch = line.match(/^\s*[-*]\s+(.+)/);
            if (bulletMatch) {
                const item = bulletMatch[1].replace(/\*+/g, '').trim();
                if (item) {
                    deliverables.push(item);
                }
            }
            // Extract use cases (UC-X format)
            const ucMatch = line.match(/UC-\d+/g);
            if (ucMatch) {
                useCases.push(...ucMatch);
            }
        }
    }
    if (!inPhase) {
        return null;
    }
    return {
        number: phase,
        name,
        goal,
        deliverables: deliverables.slice(0, 5), // Limit to first 5
        useCases: [...new Set(useCases)], // Deduplicate
    };
}
/**
 * Load all phases from ROADMAP.md
 */
export async function loadAllPhases(paths) {
    const roadmapFile = paths.roadmapFile;
    if (!await fs.pathExists(roadmapFile)) {
        return [];
    }
    const content = await fs.readFile(roadmapFile, 'utf-8');
    // Find all phase numbers in the roadmap
    const phaseMatches = content.matchAll(/Phase\s+(\d+)/gi);
    const phaseNumbers = new Set();
    for (const match of phaseMatches) {
        phaseNumbers.add(parseInt(match[1], 10));
    }
    // Load info for each phase
    const phases = [];
    for (const num of [...phaseNumbers].sort((a, b) => a - b)) {
        const info = parsePhaseFromRoadmap(content, num);
        if (info) {
            phases.push(info);
        }
    }
    return phases;
}
/**
 * Check if a phase is complete by looking at VERIFICATION.md
 */
export async function isPhaseComplete(paths, phase) {
    const paddedPhase = String(phase).padStart(2, '0');
    // Find phase directory
    try {
        const phaseDirs = await fs.readdir(paths.phasesDir);
        const matchingDir = phaseDirs.find((d) => d.startsWith(`${paddedPhase}-`));
        if (!matchingDir) {
            return false;
        }
        const phaseDir = path.join(paths.phasesDir, matchingDir);
        const files = await fs.readdir(phaseDir);
        const verifFile = files.find((f) => f.endsWith('-VERIFICATION.md'));
        if (!verifFile) {
            return false;
        }
        const verifPath = path.join(phaseDir, verifFile);
        const content = await fs.readFile(verifPath, 'utf-8');
        // Check for passed status or COMPLETE marker
        // Supports multiple formats:
        // - "status: passed" (lowercase, start of line)
        // - "**Status:** COMPLETE" (markdown bold with colon inside)
        // - "**Status**: COMPLETE" (markdown bold with colon outside)
        // - "Status: COMPLETE"
        // - "PHASE COMPLETE"
        if (/^status:\s*passed/im.test(content)) {
            return true;
        }
        // Match Status followed by any combo of *, :, whitespace, then COMPLETE/passed
        if (/Status[\s*:]+(?:COMPLETE|passed|verified)/i.test(content)) {
            return true;
        }
        if (content.includes('PHASE COMPLETE')) {
            return true;
        }
        return false;
    }
    catch {
        return false;
    }
}
/**
 * Get phase status from VERIFICATION.md
 */
export async function getPhaseStatus(paths, phase) {
    const paddedPhase = String(phase).padStart(2, '0');
    try {
        const phaseDirs = await fs.readdir(paths.phasesDir);
        const matchingDir = phaseDirs.find((d) => d.startsWith(`${paddedPhase}-`));
        if (!matchingDir) {
            return 'pending';
        }
        const phaseDir = path.join(paths.phasesDir, matchingDir);
        const files = await fs.readdir(phaseDir);
        const verifFile = files.find((f) => f.endsWith('-VERIFICATION.md'));
        if (!verifFile) {
            // Check if any work was done
            const summaryFile = files.find((f) => f.endsWith('-SUMMARY.md'));
            if (summaryFile) {
                return 'needs_verification';
            }
            return 'incomplete';
        }
        const verifPath = path.join(phaseDir, verifFile);
        const content = await fs.readFile(verifPath, 'utf-8');
        // Extract status - supports multiple formats:
        // - "status: passed" (lowercase)
        // - "**Status:** COMPLETE" (markdown bold with colon inside)
        // - "**Status**: COMPLETE" (markdown bold with colon outside)
        // - "Status: COMPLETE"
        // Match Status followed by any combo of *, :, whitespace, then capture the status word
        const statusMatch = content.match(/Status[\s*:]+(\w+)/i);
        if (statusMatch) {
            const status = statusMatch[1].toLowerCase();
            // Map COMPLETE to passed
            if (status === 'complete' || status === 'passed' || status === 'verified') {
                return 'passed';
            }
            if (status === 'gaps_found' || status === 'gaps') {
                return 'gaps_found';
            }
            if (status === 'human_needed' || status === 'human') {
                return 'human_needed';
            }
            return status;
        }
        if (content.includes('PHASE COMPLETE')) {
            return 'passed';
        }
        if (content.includes('GAPS FOUND')) {
            return 'gaps_found';
        }
        return 'incomplete';
    }
    catch {
        return 'pending';
    }
}
/**
 * Get phase directory path
 */
export async function getPhaseDir(paths, phase) {
    const paddedPhase = String(phase).padStart(2, '0');
    try {
        const phaseDirs = await fs.readdir(paths.phasesDir);
        const matchingDir = phaseDirs.find((d) => d.startsWith(`${paddedPhase}-`));
        if (!matchingDir) {
            return null;
        }
        return path.join(paths.phasesDir, matchingDir);
    }
    catch {
        return null;
    }
}
/**
 * Get relative phase directory path (for prompts)
 */
export async function getRelativePhaseDir(paths, phase) {
    const paddedPhase = String(phase).padStart(2, '0');
    try {
        const phaseDirs = await fs.readdir(paths.phasesDir);
        const matchingDir = phaseDirs.find((d) => d.startsWith(`${paddedPhase}-`));
        if (matchingDir) {
            return `.planning/phases/${matchingDir}`;
        }
    }
    catch {
        // Ignore
    }
    return `.planning/phases/${paddedPhase}-unknown`;
}
//# sourceMappingURL=phase-loader.js.map