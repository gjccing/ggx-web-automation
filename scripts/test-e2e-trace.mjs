#!/usr/bin/env node
// Runs the E2E suite with full tracing enabled, then opens the HTML report.
// Extra args are forwarded to `playwright test`, e.g.:
//   npm run test:e2e:trace -- --project=ggx-moving --grep @BET-4357
import { spawnSync } from "node:child_process";

const extraArgs = process.argv.slice(2);

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  return result.status ?? 1;
}

// Generate BDD specs first (mirrors the other test:e2e scripts).
const genStatus = run("npx", ["bddgen"]);
if (genStatus !== 0) {
  process.exit(genStatus);
}

// Run tests with tracing on. Don't bail on failures — we still want the report.
run("npx", [
  "playwright",
  "test",
  "--pass-with-no-tests",
  "--trace",
  "on",
  ...extraArgs,
]);

// Open the HTML report (blocks, serving the report until Ctrl+C).
run("npx", ["playwright", "show-report"]);
