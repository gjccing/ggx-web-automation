# ggx-web-automation

Cross-product web E2E tests for GoGoX (Playwright + Gherkin via [playwright-bdd](https://github.com/vitalets/playwright-bdd)).

## Prerequisites

- Node.js 18+
- `npm install` (installs dependencies and Playwright browsers via `postinstall`)

### MCP (for AI agents)

Configure in your IDE:

| MCP | Purpose | Setup |
|-----|---------|--------|
| **Browser** | Explore UI when adding a product | Enable `cursor-ide-browser` in IDE |
| **Atlassian** | Jira tickets, JQL search | Enable Atlassian MCP, complete OAuth once |
| **GitHub** | Pull requests, repo context | GitHub MCP + personal access token |

See [.agents/AGENTS.md](.agents/AGENTS.md) for workflow details.

Running `npm run test:e2e` does **not** require MCP — only Playwright and product URLs in `.env`.

## Quick start

```bash
npm install
cp .env.example .env
# edit .env with product base URLs if needed
```

### Add a product

Ask the agent to use the **add-product** skill (`.agents/skills/add-product/SKILL.md`), providing:

- name (kebab-case)
- url (staging or localhost)
- GitHub repo URL
- Jira board URL

Then run smoke tests:

```bash
npm run test:e2e -- --project=<name>
```

## Test layout

```
regression/
  *.feature
  *.steps.ts
<project>/<TICKET-ID>/
  *.feature
  *.steps.ts
```

Ticket tests from Jira: see `.agents/skills/jira-to-e2e/` or paste a Jira browse URL to the agent.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Generate BDD tests and run all products |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run bdd:gen` | Generate Playwright tests from `.feature` (no run) |
| `npm run test:e2e:report` | Open HTML report |

## Agent setup

See [.agents/AGENTS.md](.agents/AGENTS.md).

## Project layout

```
.agents/       # agent instructions + skills
_template/     # scaffold for new products
<project>/     # one folder per product
  README.md
  KNOWLEDGE.md
  regression/
```
