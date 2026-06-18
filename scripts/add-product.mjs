import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RESERVED = new Set(['_template', '.agents', 'lib', 'scripts', 'node_modules']);

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--name') result.name = argv[++i];
    if (argv[i] === '--url') result.url = argv[++i];
    if (argv[i] === '--github') result.github = argv[++i];
    if (argv[i] === '--jira') result.jira = argv[++i];
    if (argv[i] === '--jira-key') result.jiraKey = argv[++i];
    if (argv[i] === '--yes' || argv[i] === '-y') result.yes = true;
  }
  return result;
}

function validateName(name) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    throw new Error(`Invalid name "${name}". Use kebab-case, e.g. b2b-website.`);
  }
  if (RESERVED.has(name)) {
    throw new Error(`"${name}" is a reserved folder name.`);
  }
  if (existsSync(join(process.cwd(), name))) {
    throw new Error(`Product folder already exists: ${name}`);
  }
}

function validateUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('URL must start with http:// or https://');
  }
}

function parseGithubUrl(inputUrl) {
  const trimmed = inputUrl.trim().replace(/\.git$/, '').replace(/\/$/, '');
  const match = trimmed.match(/github\.com[/:]([^/]+)\/([^/]+)/i);
  if (!match) {
    throw new Error(`Invalid GitHub URL: ${inputUrl}`);
  }
  return {
    ownerRepo: `${match[1]}/${match[2]}`,
    url: trimmed.startsWith('http') ? trimmed : `https://github.com/${match[1]}/${match[2]}`,
  };
}

function extractJiraProjectKey(url) {
  // /jira/software/c/projects/BET/boards/87
  const fromProjects = url.match(/\/projects\/([A-Z][A-Z0-9]+)(?:\/|$|\?)/i)?.[1];
  if (fromProjects) return fromProjects.toUpperCase();

  // /browse/BET-4344 or /browse/BET
  const fromBrowse = url.match(/\/browse\/([A-Z][A-Z0-9]+)(?:-\d+)?(?:\?|$|\/)/i)?.[1];
  if (fromBrowse) return fromBrowse.toUpperCase();

  return null;
}

function parseJiraUrl(inputUrl) {
  const trimmed = inputUrl.trim().replace(/\/$/, '');
  validateUrl(trimmed);

  if (!/atlassian\.net/i.test(trimmed)) {
    throw new Error('Jira URL must be an Atlassian Cloud URL (e.g. https://gogotech.atlassian.net/...)');
  }

  return {
    url: trimmed,
    projectKey: extractJiraProjectKey(trimmed),
  };
}

function validateJiraProjectKey(key) {
  if (!/^[A-Z][A-Z0-9]+$/.test(key)) {
    throw new Error(`Invalid Jira project key "${key}". Use uppercase letters/numbers, e.g. B2B.`);
  }
}

function toEnvVar(name) {
  return `${name.replace(/-/g, '_').toUpperCase()}_BASE_URL`;
}

function upsertEnvLine(filePath, key, value) {
  const line = `${key}=${value}`;
  if (!existsSync(filePath)) {
    writeFileSync(filePath, `${line}\n`);
    return;
  }

  const content = readFileSync(filePath, 'utf8');
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(content)) {
    writeFileSync(filePath, content.replace(pattern, line));
  } else {
    const suffix = content.endsWith('\n') ? '' : '\n';
    writeFileSync(filePath, `${content}${suffix}${line}\n`);
  }
}

function writeProductReadme({ name, envVar, url, github, jira }) {
  return `# ${name}

## Metadata (for agents)

| Field | Value |
|-------|-------|
| Project ID | \`${name}\` |
| Base URL env | \`${envVar}\` |
| GitHub repo | \`${github.ownerRepo}\` |
| GitHub URL | ${github.url} |
| Jira project key | \`${jira.projectKey}\` |
| Jira URL | ${jira.url} |

## Environment

Set in the repo root \`.env\`:

\`\`\`bash
${envVar}=${url}
\`\`\`

Each suite folder has the same layout:

\`\`\`
regression/
  *.feature
  steps/
\`\`\`
`;
}

function createProduct({ name, url, githubInput, jiraInput, jiraProjectKey }) {
  validateName(name);
  validateUrl(url);
  const github = parseGithubUrl(githubInput);
  const jiraParsed = parseJiraUrl(jiraInput);
  const jira = {
    url: jiraParsed.url,
    projectKey: jiraProjectKey ?? jiraParsed.projectKey ?? 'XXX',
  };
  const envVar = toEnvVar(name);
  const root = process.cwd();
  const productDir = join(root, name);

  cpSync(join(root, '_template'), productDir, { recursive: true });

  writeFileSync(join(productDir, 'README.md'), writeProductReadme({ name, envVar, url, github, jira }));

  const stepsPath = join(productDir, 'regression', 'steps', 'smoke.steps.ts');
  const stepsContent = readFileSync(stepsPath, 'utf8')
    .replace(/TEMPLATE_BASE_URL/g, envVar)
    .replace(/\/\/ When importing:.*\n/, `// Base URL env var for ${name}.\n`);
  writeFileSync(stepsPath, stepsContent);

  upsertEnvLine(join(root, '.env.example'), envVar, url);

  const envPath = join(root, '.env');
  const envExamplePath = join(root, '.env.example');
  if (!existsSync(envPath) && existsSync(envExamplePath)) {
    cpSync(envExamplePath, envPath);
  }
  upsertEnvLine(envPath, envVar, url);

  return { name, envVar, url, github, jira };
}

async function promptRequired(rl, label, validate) {
  while (true) {
    const answer = (await rl.question(label)).trim();
    if (!answer) {
      console.log('  This field is required.\n');
      continue;
    }
    try {
      validate(answer);
      return answer;
    } catch (error) {
      console.log(`  ${error instanceof Error ? error.message : error}\n`);
    }
  }
}

async function promptConfirm(rl, summary) {
  console.log('\nReview:');
  console.log(`  Product name:     ${summary.name}`);
  console.log(`  Base URL:         ${summary.url}`);
  console.log(`  GitHub:           ${summary.github}`);
  console.log(`  Jira:             ${summary.jira}`);
  console.log(`  Jira project key: ${summary.jiraProjectKey}`);
  console.log(`  Env variable:     ${summary.envVar}`);
  console.log('');

  while (true) {
    const answer = (await rl.question('Create this product? (y/n) ')).trim().toLowerCase();
    if (answer === 'y' || answer === 'yes') return true;
    if (answer === 'n' || answer === 'no') return false;
    console.log('  Please answer y or n.');
  }
}

async function collectInteractive() {
  const rl = createInterface({ input, output });

  console.log('\nAdd a new product\n');

  const name = await promptRequired(rl, 'Product name (kebab-case, e.g. b2b-website): ', validateName);
  const url = await promptRequired(rl, 'Base URL (e.g. https://hk-b2b-stag.gogox.com): ', validateUrl);
  const github = await promptRequired(
    rl,
    'GitHub URL (e.g. https://github.com/gjccing/b2b-website): ',
    parseGithubUrl,
  );
  const jiraInput = await promptRequired(
    rl,
    'Jira URL (project, board, or ticket — e.g. https://gogotech.atlassian.net/browse/BET): ',
    parseJiraUrl,
  );

  const jiraParsed = parseJiraUrl(jiraInput);
  let jiraProjectKey = jiraParsed.projectKey;
  if (!jiraProjectKey) {
    jiraProjectKey = await promptRequired(
      rl,
      'Jira project key (e.g. BET): ',
      validateJiraProjectKey,
    );
  }

  const envVar = toEnvVar(name);
  const confirmed = await promptConfirm(rl, {
    name,
    url,
    github,
    jira: jiraInput,
    jiraProjectKey,
    envVar,
  });
  rl.close();

  if (!confirmed) {
    console.log('\nCancelled.');
    process.exit(0);
  }

  return { name, url, github, jira: jiraInput, jiraProjectKey };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const hasAllFlags = args.name && args.url && args.github && args.jira;

  let name;
  let url;
  let github;
  let jira;
  let jiraProjectKey;

  if (hasAllFlags) {
    name = args.name;
    url = args.url;
    github = args.github;
    jira = args.jira;
    const jiraParsed = parseJiraUrl(jira);
    jiraProjectKey = args.jiraKey ?? jiraParsed.projectKey ?? undefined;
    if (!jiraProjectKey) {
      console.error(
        'Could not detect Jira project key from URL. Use a /browse/KEY, /projects/KEY/, or ticket URL, or pass --jira-key.',
      );
      process.exit(1);
    }
    if (args.jiraKey) validateJiraProjectKey(jiraProjectKey);
  } else if (args.name || args.url || args.github || args.jira) {
    console.error('Provide all flags together: --name --url --github --jira');
    console.error('Or run without flags for interactive mode: npm run add-product');
    process.exit(1);
  } else {
    ({ name, url, github, jira, jiraProjectKey } = await collectInteractive());
  }

  const result = createProduct({ name, url, githubInput: github, jiraInput: jira, jiraProjectKey });

  console.log('\nProduct created.');
  console.log(`  folder:  ${result.name}/`);
  console.log(`  env:     ${result.envVar}=${result.url} (written to .env)`);
  console.log(`  github:  ${result.github.ownerRepo}`);
  console.log(`  jira:    ${result.jira.projectKey} (${result.jira.url})`);
  console.log('\nNext steps:');
  console.log(`  npm run test:e2e -- --project=${result.name}`);
}

main().catch((error) => {
  console.error(`\nError: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
