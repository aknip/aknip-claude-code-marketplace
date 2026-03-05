import type { DerivedPaths } from '../types/config.js';
/**
 * Template placeholders that can be substituted
 */
export interface TemplatePlaceholders {
    SPRINT?: string;
    PROJECT_DIR?: string;
    PADDED_SPRINT?: string;
    SPRINT_DIR?: string;
    SPRINT_NAME?: string;
    VERSION?: string;
}
/**
 * Generate a prompt file from a template with placeholder substitution
 */
export declare function generatePrompt(templateName: string, outputFile: string, options: {
    paths: DerivedPaths;
    projectDir: string;
    sprint?: number;
    version?: string;
    additionalPlaceholders?: Record<string, string>;
}): Promise<void>;
/**
 * Append gap closure instructions to a prompt file
 */
export declare function appendGapClosureInstructions(promptFile: string, sprintDir: string): Promise<void>;
/**
 * Append execution gap closure instructions
 */
export declare function appendExecutionGapInstructions(promptFile: string): Promise<void>;
/**
 * Get list of available prompt templates
 */
export declare function listTemplates(templatesDir: string): Promise<string[]>;
/**
 * Check if a template exists
 */
export declare function templateExists(templateName: string, paths: DerivedPaths): Promise<boolean>;
//# sourceMappingURL=prompt-generator.d.ts.map