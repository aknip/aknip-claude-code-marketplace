import type { PhaseInfo, DerivedPaths, PhaseStatus } from '../types/config.js';
/**
 * Load phase information from ROADMAP.md
 */
export declare function loadPhaseInfo(paths: DerivedPaths, phase: number): Promise<PhaseInfo | null>;
/**
 * Load all phases from ROADMAP.md
 */
export declare function loadAllPhases(paths: DerivedPaths): Promise<PhaseInfo[]>;
/**
 * Check if a phase is complete by looking at VERIFICATION.md
 */
export declare function isPhaseComplete(paths: DerivedPaths, phase: number): Promise<boolean>;
/**
 * Get phase status from VERIFICATION.md
 */
export declare function getPhaseStatus(paths: DerivedPaths, phase: number): Promise<PhaseStatus>;
/**
 * Get phase directory path
 */
export declare function getPhaseDir(paths: DerivedPaths, phase: number): Promise<string | null>;
/**
 * Get relative phase directory path (for prompts)
 */
export declare function getRelativePhaseDir(paths: DerivedPaths, phase: number): Promise<string>;
//# sourceMappingURL=phase-loader.d.ts.map