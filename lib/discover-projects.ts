import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const EXCLUDED_DIRS = new Set([
  '_template',
  '.agents',
  'node_modules',
  'lib',
  'playwright-report',
  'test-results',
  '.features-gen',
]);

export function discoverProjects(rootDir = process.cwd()): string[] {
  return readdirSync(rootDir)
    .filter((name) => {
      if (name.startsWith('.')) return false;
      if (EXCLUDED_DIRS.has(name)) return false;
      return statSync(join(rootDir, name)).isDirectory();
    })
    .sort();
}
