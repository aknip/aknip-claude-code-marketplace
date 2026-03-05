import fs from 'fs-extra';
import path from 'node:path';
/**
 * Generate a prompt file from a template with placeholder substitution
 */
export async function generatePrompt(templateName, outputFile, options) {
    const { paths, projectDir, sprint, version, additionalPlaceholders } = options;
    const templateFile = path.join(paths.promptTemplatesDir, templateName);
    if (!await fs.pathExists(templateFile)) {
        throw new Error(`Prompt template not found: ${templateFile}`);
    }
    let template = await fs.readFile(templateFile, 'utf-8');
    // Compute sprint-specific values
    let paddedSprint = '';
    let sprintDir = '';
    let sprintName = '';
    if (sprint !== undefined) {
        paddedSprint = String(sprint).padStart(2, '0');
        // Find sprint directory
        try {
            const sprintDirs = await fs.readdir(paths.sprintsDir);
            const matchingDir = sprintDirs.find((d) => d.startsWith(`${paddedSprint}-`));
            if (matchingDir) {
                sprintDir = `.planning/sprints/${matchingDir}`;
                sprintName = matchingDir.replace(`${paddedSprint}-`, '');
            }
            else {
                sprintDir = `.planning/sprints/${paddedSprint}-unknown`;
            }
        }
        catch {
            sprintDir = `.planning/sprints/${paddedSprint}-unknown`;
        }
    }
    // Build placeholders object
    const placeholders = {
        SPRINT: sprint?.toString() ?? '',
        PROJECT_DIR: projectDir,
        PADDED_SPRINT: paddedSprint,
        SPRINT_DIR: sprintDir,
        SPRINT_NAME: sprintName,
        VERSION: version ?? '',
        ...additionalPlaceholders,
    };
    // Substitute all placeholders
    for (const [key, value] of Object.entries(placeholders)) {
        template = template.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value ?? '');
    }
    // Ensure output directory exists
    await fs.ensureDir(path.dirname(outputFile));
    // Write output file
    await fs.writeFile(outputFile, template, 'utf-8');
}
/**
 * Append gap closure instructions to a prompt file
 */
export async function appendGapClosureInstructions(promptFile, sprintDir) {
    const gapInstructions = `

## GAP CLOSURE MODE

This is a gap closure run. Read the VERIFICATION.md file to find gaps:
- ${sprintDir}/*-VERIFICATION.md

Create plans ONLY to close the identified gaps, not to re-implement existing work.
`;
    await fs.appendFile(promptFile, gapInstructions, 'utf-8');
}
/**
 * Append execution gap closure instructions
 */
export async function appendExecutionGapInstructions(promptFile) {
    const gapInstructions = `

## GAP CLOSURE MODE

Execute ONLY the gap closure plans, not all plans in the sprint.
Look for plans created after the initial execution (gap closure plans).
`;
    await fs.appendFile(promptFile, gapInstructions, 'utf-8');
}
/**
 * Get list of available prompt templates
 */
export async function listTemplates(templatesDir) {
    try {
        const files = await fs.readdir(templatesDir);
        return files.filter((f) => f.endsWith('.md'));
    }
    catch {
        return [];
    }
}
/**
 * Check if a template exists
 */
export async function templateExists(templateName, paths) {
    const templateFile = path.join(paths.promptTemplatesDir, templateName);
    return fs.pathExists(templateFile);
}
//# sourceMappingURL=prompt-generator.js.map