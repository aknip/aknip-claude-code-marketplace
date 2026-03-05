import fs from 'fs-extra';
import type { AutopilotState, DerivedPaths } from '../types/config.js';

/**
 * Generate ISO timestamp string
 */
function isoTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Update autopilot state in PROJECT-STATUS.md
 */
export async function updateAutopilotState(
  paths: DerivedPaths,
  state: Partial<AutopilotState>
): Promise<void> {
  const projectStatusFile = paths.projectStatusFile;

  // Read current PROJECT-STATUS.md
  let content = '';
  try {
    content = await fs.readFile(projectStatusFile, 'utf-8');
  } catch {
    // File doesn't exist, create it with the state section
    content = `# State\n\n${generateAutopilotSection(state)}`;
    await fs.writeFile(projectStatusFile, content, 'utf-8');
    return;
  }

  // Check if Autopilot section exists
  if (content.includes('## Autopilot')) {
    // Update existing section
    content = updateExistingSection(content, state);
  } else {
    // Append new section
    content += `\n${generateAutopilotSection(state)}`;
  }

  await fs.writeFile(projectStatusFile, content, 'utf-8');
}

/**
 * Generate the Autopilot section content
 */
function generateAutopilotSection(state: Partial<AutopilotState>): string {
  const now = isoTimestamp();

  return `## Autopilot

- **Mode:** ${state.mode || 'idle'}
- **Started:** ${state.startedAt ? isoTimestamp(state.startedAt) : now}
- **Current Sprint:** ${state.currentSprint ?? 'none'}
- **Sprints Remaining:** ${state.sprintsRemaining?.join(', ') || 'none'}
- **Sprints Completed:** ${state.sprintsCompleted?.join(', ') || 'none'}
- **Checkpoints Pending:** ${state.checkpointsPending ?? 0}
- **Last Error:** ${state.lastError || 'none'}
- **Total Tokens:** ${state.totalTokens ?? 0}
- **Total Cost:** $${(state.totalCost ?? 0).toFixed(2)}
- **Updated:** ${now}
`;
}

/**
 * Update existing Autopilot section in content
 */
function updateExistingSection(
  content: string,
  state: Partial<AutopilotState>
): string {
  const now = isoTimestamp();

  // Update individual fields using regex
  const updates: [RegExp, string][] = [];

  if (state.mode !== undefined) {
    updates.push([/^- \*\*Mode:\*\* .*/m, `- **Mode:** ${state.mode}`]);
  }

  if (state.currentSprint !== undefined) {
    updates.push([
      /^- \*\*Current Sprint:\*\* .*/m,
      `- **Current Sprint:** ${state.currentSprint ?? 'none'}`,
    ]);
  }

  if (state.sprintsRemaining !== undefined) {
    updates.push([
      /^- \*\*Sprints Remaining:\*\* .*/m,
      `- **Sprints Remaining:** ${state.sprintsRemaining.join(', ') || 'none'}`,
    ]);
  }

  if (state.sprintsCompleted !== undefined) {
    updates.push([
      /^- \*\*Sprints Completed:\*\* .*/m,
      `- **Sprints Completed:** ${state.sprintsCompleted.join(', ') || 'none'}`,
    ]);
  }

  if (state.checkpointsPending !== undefined) {
    updates.push([
      /^- \*\*Checkpoints Pending:\*\* .*/m,
      `- **Checkpoints Pending:** ${state.checkpointsPending}`,
    ]);
  }

  if (state.lastError !== undefined) {
    updates.push([
      /^- \*\*Last Error:\*\* .*/m,
      `- **Last Error:** ${state.lastError || 'none'}`,
    ]);
  }

  if (state.totalTokens !== undefined) {
    updates.push([
      /^- \*\*Total Tokens:\*\* .*/m,
      `- **Total Tokens:** ${state.totalTokens}`,
    ]);
  }

  if (state.totalCost !== undefined) {
    updates.push([
      /^- \*\*Total Cost:\*\* .*/m,
      `- **Total Cost:** $${state.totalCost.toFixed(2)}`,
    ]);
  }

  // Always update timestamp
  updates.push([/^- \*\*Updated:\*\* .*/m, `- **Updated:** ${now}`]);

  // Apply updates
  for (const [regex, replacement] of updates) {
    content = content.replace(regex, replacement);
  }

  return content;
}

/**
 * Read current autopilot state from PROJECT-STATUS.md
 */
export async function readAutopilotState(
  paths: DerivedPaths
): Promise<Partial<AutopilotState> | null> {
  try {
    const content = await fs.readFile(paths.projectStatusFile, 'utf-8');

    if (!content.includes('## Autopilot')) {
      return null;
    }

    // Extract values using regex
    const extract = (key: string): string | undefined => {
      const match = content.match(new RegExp(`^- \\*\\*${key}:\\*\\* (.*)$`, 'm'));
      return match?.[1]?.trim();
    };

    const mode = extract('Mode') as AutopilotState['mode'] | undefined;
    const currentSprint = extract('Current Sprint');
    const sprintsRemaining = extract('Sprints Remaining');
    const sprintsCompleted = extract('Sprints Completed');
    const checkpointsPending = extract('Checkpoints Pending');
    const lastError = extract('Last Error');
    const totalTokens = extract('Total Tokens');
    const totalCost = extract('Total Cost');

    return {
      mode: mode || 'idle',
      currentSprint:
        currentSprint && currentSprint !== 'none'
          ? parseInt(currentSprint, 10)
          : undefined,
      sprintsRemaining:
        sprintsRemaining && sprintsRemaining !== 'none'
          ? sprintsRemaining.split(', ').map((p) => parseInt(p, 10))
          : [],
      sprintsCompleted:
        sprintsCompleted && sprintsCompleted !== 'none'
          ? sprintsCompleted.split(', ').map((p) => parseInt(p, 10))
          : [],
      checkpointsPending: checkpointsPending
        ? parseInt(checkpointsPending, 10)
        : 0,
      lastError: lastError && lastError !== 'none' ? lastError : undefined,
      totalTokens: totalTokens ? parseInt(totalTokens, 10) : 0,
      totalCost: totalCost
        ? parseFloat(totalCost.replace('$', ''))
        : 0,
    };
  } catch {
    return null;
  }
}
