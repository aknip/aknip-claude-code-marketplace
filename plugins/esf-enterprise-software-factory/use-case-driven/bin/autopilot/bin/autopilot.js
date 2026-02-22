#!/usr/bin/env node
/**
 * UC Autopilot CLI wrapper
 *
 * This is the executable entry point for the autopilot.
 * It loads the compiled TypeScript from dist/ or runs via tsx in development.
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distEntry = join(__dirname, '..', 'dist', 'index.js');
const srcEntry = join(__dirname, '..', 'src', 'index.tsx');

// Check if compiled version exists
if (existsSync(distEntry)) {
  // Run compiled version
  const child = spawn('node', [distEntry, ...process.argv.slice(2)], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
} else {
  // Run via tsx (development mode)
  const child = spawn('npx', ['tsx', srcEntry, ...process.argv.slice(2)], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}
