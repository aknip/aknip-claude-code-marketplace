import fs from 'fs-extra';
import path from 'node:path';
import type { SprintInfo, DerivedPaths, SprintStatus } from '../types/config.js';

/**
 * Load sprint information from PROJECT-PLAN.md
 */
export async function loadSprintInfo(
  paths: DerivedPaths,
  sprint: number
): Promise<SprintInfo | null> {
  const projectPlanFile = paths.projectPlanFile;

  if (!await fs.pathExists(projectPlanFile)) {
    return {
      number: sprint,
      name: `Sprint ${sprint}`,
      deliverables: [],
      useCases: [],
    };
  }

  const content = await fs.readFile(projectPlanFile, 'utf-8');
  return parseSprintFromProjectPlan(content, sprint);
}

/**
 * Parse a single sprint from PROJECT-PLAN.md content
 */
function parseSprintFromProjectPlan(content: string, sprint: number): SprintInfo | null {
  const lines = content.split('\n');
  let inPhase = false;
  let name = `Sprint ${sprint}`;
  let goal: string | undefined;
  const deliverables: string[] = [];
  const useCases: string[] = [];

  for (const line of lines) {
    // Check for sprint header (e.g., "### Sprint 1: Setup" or "## Sprint 1:")
    const phaseMatch = line.match(/^#+\s*Sprint\s+(\d+):?\s*(.*)/i);

    if (phaseMatch) {
      const phaseNum = parseInt(phaseMatch[1], 10);

      if (phaseNum === sprint) {
        inPhase = true;
        name = phaseMatch[2]?.trim().replace(/\*+/g, '') || `Sprint ${sprint}`;
        continue;
      } else if (inPhase) {
        // We've reached the next sprint, stop
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
    number: sprint,
    name,
    goal,
    deliverables: deliverables.slice(0, 5), // Limit to first 5
    useCases: [...new Set(useCases)], // Deduplicate
  };
}

/**
 * Load all sprints from PROJECT-PLAN.md
 */
export async function loadAllSprints(
  paths: DerivedPaths
): Promise<SprintInfo[]> {
  const projectPlanFile = paths.projectPlanFile;

  if (!await fs.pathExists(projectPlanFile)) {
    return [];
  }

  const content = await fs.readFile(projectPlanFile, 'utf-8');

  // Find all sprint numbers in the roadmap
  const phaseMatches = content.matchAll(/Sprint\s+(\d+)/gi);
  const sprintNumbers = new Set<number>();

  for (const match of phaseMatches) {
    sprintNumbers.add(parseInt(match[1], 10));
  }

  // Load info for each sprint
  const sprints: SprintInfo[] = [];
  for (const num of [...sprintNumbers].sort((a, b) => a - b)) {
    const info = parseSprintFromProjectPlan(content, num);
    if (info) {
      sprints.push(info);
    }
  }

  return sprints;
}

/**
 * Check if a sprint is complete by looking at VERIFICATION.md
 */
export async function isSprintComplete(
  paths: DerivedPaths,
  sprint: number
): Promise<boolean> {
  const paddedSprint = String(sprint).padStart(2, '0');

  // Find sprint directory
  try {
    const sprintDirs = await fs.readdir(paths.sprintsDir);
    const matchingDir = sprintDirs.find((d) => d.startsWith(`${paddedSprint}-`));

    if (!matchingDir) {
      return false;
    }

    const sprintDir = path.join(paths.sprintsDir, matchingDir);
    const files = await fs.readdir(sprintDir);
    const verifFile = files.find((f) => f.endsWith('-VERIFICATION.md'));

    if (!verifFile) {
      return false;
    }

    const verifPath = path.join(sprintDir, verifFile);
    const content = await fs.readFile(verifPath, 'utf-8');

    // Check for passed status or COMPLETE marker
    // Supports multiple formats:
    // - "status: passed" (lowercase, start of line)
    // - "**Status:** COMPLETE" (markdown bold with colon inside)
    // - "**Status**: COMPLETE" (markdown bold with colon outside)
    // - "Status: COMPLETE"
    // - "SPRINT COMPLETE"
    if (/^status:\s*passed/im.test(content)) {
      return true;
    }
    // Match Status followed by any combo of *, :, whitespace, then COMPLETE/passed
    if (/Status[\s*:]+(?:COMPLETE|passed|verified)/i.test(content)) {
      return true;
    }
    if (content.includes('SPRINT COMPLETE')) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Get sprint status from VERIFICATION.md
 */
export async function getSprintStatus(
  paths: DerivedPaths,
  sprint: number
): Promise<SprintStatus> {
  const paddedSprint = String(sprint).padStart(2, '0');

  try {
    const sprintDirs = await fs.readdir(paths.sprintsDir);
    const matchingDir = sprintDirs.find((d) => d.startsWith(`${paddedSprint}-`));

    if (!matchingDir) {
      return 'pending';
    }

    const sprintDir = path.join(paths.sprintsDir, matchingDir);
    const files = await fs.readdir(sprintDir);
    const verifFile = files.find((f) => f.endsWith('-VERIFICATION.md'));

    if (!verifFile) {
      // Check if any work was done
      const summaryFile = files.find((f) => f.endsWith('-SUMMARY.md'));
      if (summaryFile) {
        return 'needs_verification';
      }
      return 'incomplete';
    }

    const verifPath = path.join(sprintDir, verifFile);
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
      return status as SprintStatus;
    }

    if (content.includes('SPRINT COMPLETE')) {
      return 'passed';
    }
    if (content.includes('GAPS FOUND')) {
      return 'gaps_found';
    }

    return 'incomplete';
  } catch {
    return 'pending';
  }
}

/**
 * Get sprint directory path
 */
export async function getSprintDir(
  paths: DerivedPaths,
  sprint: number
): Promise<string | null> {
  const paddedSprint = String(sprint).padStart(2, '0');

  try {
    const sprintDirs = await fs.readdir(paths.sprintsDir);
    const matchingDir = sprintDirs.find((d) => d.startsWith(`${paddedSprint}-`));

    if (!matchingDir) {
      return null;
    }

    return path.join(paths.sprintsDir, matchingDir);
  } catch {
    return null;
  }
}

/**
 * Get relative sprint directory path (for prompts)
 */
export async function getRelativeSprintDir(
  paths: DerivedPaths,
  sprint: number
): Promise<string> {
  const paddedSprint = String(sprint).padStart(2, '0');

  try {
    const sprintDirs = await fs.readdir(paths.sprintsDir);
    const matchingDir = sprintDirs.find((d) => d.startsWith(`${paddedSprint}-`));

    if (matchingDir) {
      return `.planning/sprints/${matchingDir}`;
    }
  } catch {
    // Ignore
  }

  return `.planning/sprints/${paddedSprint}-unknown`;
}
