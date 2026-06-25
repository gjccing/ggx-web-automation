import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, defineBddProject } from 'playwright-bdd';
import dotenv from 'dotenv';
import { discoverProjects } from './lib/discover-projects.js';

dotenv.config();

const projects = discoverProjects();

function featureGlobs(name: string) {
  return [`${name}/**/*.feature`];
}

function stepGlobs(name: string) {
  return [`${name}/**/*.steps.ts`];
}

const bddProjects =
  projects.length > 0
    ? projects.map((name) => ({
        ...defineBddProject({
          name,
          features: featureGlobs(name),
          steps: stepGlobs(name),
        }),
      }))
    : [
        {
          name: 'no-products',
          testDir: defineBddConfig({
            features: '_noop/**/*.feature',
            steps: '_noop/**/*.steps.ts',
            outputDir: '.features-gen',
          }),
          testMatch: /(?!)/,
        },
      ];

export default defineConfig({
  projects: bddProjects,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
