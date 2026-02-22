import fs from 'fs-extra';
/**
 * Generate ISO timestamp string
 */
function isoTimestamp(date = new Date()) {
    return date.toISOString().replace('T', ' ').substring(0, 19);
}
/**
 * Update autopilot state in STATE.md
 */
export async function updateAutopilotState(paths, state) {
    const stateFile = paths.stateFile;
    // Read current STATE.md
    let content = '';
    try {
        content = await fs.readFile(stateFile, 'utf-8');
    }
    catch {
        // File doesn't exist, create it with the state section
        content = `# State\n\n${generateAutopilotSection(state)}`;
        await fs.writeFile(stateFile, content, 'utf-8');
        return;
    }
    // Check if Autopilot section exists
    if (content.includes('## Autopilot')) {
        // Update existing section
        content = updateExistingSection(content, state);
    }
    else {
        // Append new section
        content += `\n${generateAutopilotSection(state)}`;
    }
    await fs.writeFile(stateFile, content, 'utf-8');
}
/**
 * Generate the Autopilot section content
 */
function generateAutopilotSection(state) {
    const now = isoTimestamp();
    return `## Autopilot

- **Mode:** ${state.mode || 'idle'}
- **Started:** ${state.startedAt ? isoTimestamp(state.startedAt) : now}
- **Current Phase:** ${state.currentPhase ?? 'none'}
- **Phases Remaining:** ${state.phasesRemaining?.join(', ') || 'none'}
- **Phases Completed:** ${state.phasesCompleted?.join(', ') || 'none'}
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
function updateExistingSection(content, state) {
    const now = isoTimestamp();
    // Update individual fields using regex
    const updates = [];
    if (state.mode !== undefined) {
        updates.push([/^- \*\*Mode:\*\* .*/m, `- **Mode:** ${state.mode}`]);
    }
    if (state.currentPhase !== undefined) {
        updates.push([
            /^- \*\*Current Phase:\*\* .*/m,
            `- **Current Phase:** ${state.currentPhase ?? 'none'}`,
        ]);
    }
    if (state.phasesRemaining !== undefined) {
        updates.push([
            /^- \*\*Phases Remaining:\*\* .*/m,
            `- **Phases Remaining:** ${state.phasesRemaining.join(', ') || 'none'}`,
        ]);
    }
    if (state.phasesCompleted !== undefined) {
        updates.push([
            /^- \*\*Phases Completed:\*\* .*/m,
            `- **Phases Completed:** ${state.phasesCompleted.join(', ') || 'none'}`,
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
 * Read current autopilot state from STATE.md
 */
export async function readAutopilotState(paths) {
    try {
        const content = await fs.readFile(paths.stateFile, 'utf-8');
        if (!content.includes('## Autopilot')) {
            return null;
        }
        // Extract values using regex
        const extract = (key) => {
            const match = content.match(new RegExp(`^- \\*\\*${key}:\\*\\* (.*)$`, 'm'));
            return match?.[1]?.trim();
        };
        const mode = extract('Mode');
        const currentPhase = extract('Current Phase');
        const phasesRemaining = extract('Phases Remaining');
        const phasesCompleted = extract('Phases Completed');
        const checkpointsPending = extract('Checkpoints Pending');
        const lastError = extract('Last Error');
        const totalTokens = extract('Total Tokens');
        const totalCost = extract('Total Cost');
        return {
            mode: mode || 'idle',
            currentPhase: currentPhase && currentPhase !== 'none'
                ? parseInt(currentPhase, 10)
                : undefined,
            phasesRemaining: phasesRemaining && phasesRemaining !== 'none'
                ? phasesRemaining.split(', ').map((p) => parseInt(p, 10))
                : [],
            phasesCompleted: phasesCompleted && phasesCompleted !== 'none'
                ? phasesCompleted.split(', ').map((p) => parseInt(p, 10))
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
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=state-manager.js.map