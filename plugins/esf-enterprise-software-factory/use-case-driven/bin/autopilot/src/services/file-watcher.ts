import { watch, FSWatcher, statSync } from 'node:fs';
import path from 'node:path';
import fs from 'fs-extra';
import type { ActivityEntry } from '../types/events.js';

/**
 * Watches project directory for file changes during execution.
 * Emits activity events so the UI shows what's happening
 * even when Claude's stream is quiet (e.g. during subagent work).
 */
export interface FileWatcherOptions {
  projectDir: string;
  onActivity: (activity: ActivityEntry) => void;
  /** Minimum ms between emitted events (debounce) */
  debounceMs?: number;
  /** Directories to watch (relative to projectDir) */
  watchDirs?: string[];
  /** File extensions to report */
  extensions?: string[];
}

export class FileActivityWatcher {
  private watchers: FSWatcher[] = [];
  private lastEmitTime = 0;
  private debounceMs: number;
  private onActivity: (activity: ActivityEntry) => void;
  private projectDir: string;
  private recentFiles = new Set<string>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: FileWatcherOptions) {
    this.projectDir = options.projectDir;
    this.onActivity = options.onActivity;
    this.debounceMs = options.debounceMs ?? 2000;
  }

  async start(watchDirs?: string[], extensions?: string[]): Promise<void> {
    const dirs = watchDirs ?? ['src', 'app', 'lib', 'components', 'server', '.planning', 'tests', 'e2e'];
    const exts = new Set(extensions ?? ['.ts', '.tsx', '.js', '.jsx', '.css', '.md', '.json', '.vue', '.svelte', '.py']);

    for (const dir of dirs) {
      const absDir = path.join(this.projectDir, dir);
      if (!await fs.pathExists(absDir)) continue;

      try {
        const watcher = watch(absDir, { recursive: true }, (_eventType, filename) => {
          if (!filename) return;
          const ext = path.extname(filename);
          if (!exts.has(ext)) return;

          // Skip node_modules, dist, .git etc.
          if (filename.includes('node_modules') || filename.includes('.git/') || filename.includes('dist/')) return;

          this.handleFileChange(dir, filename);
        });

        watcher.on('error', () => {
          // Silently ignore watch errors (dir may be deleted during execution)
        });

        this.watchers.push(watcher);
      } catch {
        // Directory doesn't support watching - skip
      }
    }
  }

  private handleFileChange(dir: string, filename: string): void {
    const now = Date.now();
    const relPath = `${dir}/${filename}`;

    // Collect files and debounce
    this.recentFiles.add(relPath);

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    // If enough time has passed since last emit, flush immediately
    if (now - this.lastEmitTime >= this.debounceMs) {
      this.flush();
    } else {
      // Otherwise schedule a flush
      this.flushTimer = setTimeout(() => this.flush(), this.debounceMs);
    }
  }

  private flush(): void {
    if (this.recentFiles.size === 0) return;

    const files = Array.from(this.recentFiles);
    this.recentFiles.clear();
    this.lastEmitTime = Date.now();

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Categorize changes
    const byType = categorizeFiles(files);

    if (byType.code.length > 0) {
      const summary = summarizeFiles(byType.code, 'code');
      this.onActivity({
        type: 'edit',
        detail: summary,
        timestamp: new Date(),
      });
    }

    if (byType.test.length > 0) {
      const summary = summarizeFiles(byType.test, 'test');
      this.onActivity({
        type: 'test',
        detail: summary,
        timestamp: new Date(),
      });
    }

    if (byType.planning.length > 0) {
      const summary = summarizeFiles(byType.planning, 'planning');
      this.onActivity({
        type: 'write',
        detail: summary,
        timestamp: new Date(),
      });
    }

    if (byType.config.length > 0) {
      const summary = summarizeFiles(byType.config, 'config');
      this.onActivity({
        type: 'edit',
        detail: summary,
        timestamp: new Date(),
      });
    }
  }

  stop(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    for (const watcher of this.watchers) {
      try {
        watcher.close();
      } catch {
        // ignore
      }
    }
    this.watchers = [];
    this.recentFiles.clear();
  }
}

interface CategorizedFiles {
  code: string[];
  test: string[];
  planning: string[];
  config: string[];
}

function categorizeFiles(files: string[]): CategorizedFiles {
  const result: CategorizedFiles = { code: [], test: [], planning: [], config: [] };

  for (const f of files) {
    const basename = path.basename(f).toLowerCase();
    if (f.includes('.planning/') || f.endsWith('-PLAN.md') || f.endsWith('-VERIFICATION.md')) {
      result.planning.push(f);
    } else if (f.includes('test') || f.includes('spec') || f.includes('e2e')) {
      result.test.push(f);
    } else if (basename === 'package.json' || basename === 'tsconfig.json' || f.endsWith('.config.ts') || f.endsWith('.config.js')) {
      result.config.push(f);
    } else {
      result.code.push(f);
    }
  }

  return result;
}

function summarizeFiles(files: string[], category: string): string {
  if (files.length === 1) {
    const short = shortPath(files[0]);
    return `${category}: ${short}`;
  }

  // Show first file + count
  const short = shortPath(files[0]);
  return `${category}: ${short} (+${files.length - 1} more)`;
}

function shortPath(filePath: string): string {
  const parts = filePath.split('/');
  if (parts.length <= 2) return filePath;
  // Show last 2 segments
  return parts.slice(-2).join('/');
}
