# GGX Web E2E Automation

Cross-product Playwright + Gherkin (playwright-bdd) E2E tests for GoGoX products.

## Repository layout

```
<project>/                    # one folder per product at repo root
  README.md                   # product context, Jira/GitHub mapping (read this first)
  regression/
    *.feature
    steps/
_template/                    # scaffold for new products
.agents/                      # agent instructions + skills
  AGENTS.md
  skills/
    jira-to-e2e/              # Jira → E2E tests
```

## Adding a product

Interactive CLI (prompts for name, base URL, GitHub URL, Jira URL):

```bash
npm run add-product
```

Non-interactive (all flags required):

```bash
npm run add-product -- --name <kebab-name> --url <base-url> --github <github-url> --jira <jira-url>
```

Run smoke tests:

```bash
npm run test:e2e -- --project=<name>
```

## Writing tests

- Use English for features, steps, and docs.
- `regression/` holds smoke / baseline tests (`*.feature` + `steps/`).
- Ticket-specific tests: `<project>/<TICKET-ID>/` with the same layout — see [jira-to-e2e skill](skills/jira-to-e2e/SKILL.md).
- Tag scenarios as needed, e.g. `@smoke`, `@regression`, plus the ticket key (`@BET-4344`).

## MCP prerequisites

Tests run without MCP. MCP helps when you write tests from Jira tickets or GitHub PRs.

| MCP | Required for |
|-----|----------------|
| **GitHub** | Read PRs and repo context |
| **Atlassian (Jira)** | Read tickets and JQL search |

**Your job:** if either MCP is missing or failing, help the user set it up in their IDE (not in `.env`).

- **GitHub** — add GitHub MCP; user needs a [personal access token](https://github.com/settings/tokens) in IDE MCP settings (e.g. Cursor `.cursor/mcp.json`).
- **Jira** — enable Atlassian MCP in IDE; user completes OAuth once.

When both work, before writing tests for a ticket:

1. Read `<project>/README.md` for Jira project key and GitHub `owner/repo`.
2. Follow the **jira-to-e2e** skill (`.agents/skills/jira-to-e2e/SKILL.md`).
