# ggx-web-automation

Cross-product web E2E tests for GoGoX (Playwright + Gherkin via [playwright-bdd](https://github.com/vitalets/playwright-bdd)).

## Prerequisites

- Node.js 18+
- `npm install` (installs dependencies and Playwright browsers via `postinstall`)

### MCP (for AI agents writing tests)

Configure in your IDE. Required when agents fetch Jira tickets or GitHub PRs before writing tests:

| MCP | Purpose | Setup |
|-----|---------|--------|
| **Atlassian** | Jira tickets, JQL search | Enable Atlassian MCP in IDE, complete OAuth once |
| **GitHub** | Pull requests, repo context | Add GitHub MCP in IDE (e.g. Cursor `.cursor/mcp.json`), use a personal access token in MCP config |

See [.agents/AGENTS.md](.agents/AGENTS.md) for GitHub MCP config example and workflow.

Running `npm run test:e2e` does **not** require MCP — only Playwright and product URLs in `.env`.

## Quick start

```bash
npm install
cp .env.example .env
# edit .env with product base URLs if needed
```

### Add a product

```bash
npm run add-product
```

Follow the prompts (product name, base URL, GitHub URL, Jira URL).

```bash
npm run test:e2e -- --project=<name>
```

## Test layout

```
regression/
  *.feature
  steps/
<project>/<TICKET-ID>/   # ticket-specific tests (same layout)
  *.feature
  steps/
```

Ticket tests from Jira: see `.agents/skills/jira-to-e2e/` or paste a Jira browse URL to the agent.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run add-product` | Interactive wizard to scaffold a new product |
| `npm run test:e2e` | Generate BDD tests and run all products |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:e2e:report` | Open HTML report |

## Agent setup

See [.agents/AGENTS.md](.agents/AGENTS.md).

## Project layout

```
.agents/       # agent instructions
_template/     # scaffold for new products
<project>/     # one folder per product (add as needed)
  regression/  # *.feature + steps/
```
