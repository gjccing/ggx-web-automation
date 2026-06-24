# GGX Web E2E Automation

Cross-product Playwright + Gherkin (playwright-bdd) E2E tests for GoGoX products.

## Repository layout

```
<project>/                    # one folder per product at repo root
  README.md                   # metadata, Jira/GitHub mapping (read first)
  KNOWLEDGE.md                # product flows, roles, pages (for agents)
  regression/
    *.feature
    *.steps.ts
_template/                    # scaffold source for new products
.agents/                      # agent instructions + skills
  AGENTS.md
  skills/
    add-product/              # onboard new product
    jira-to-e2e/              # Jira → E2E tests
```

## Adding a product

Use the **add-product** skill (`.agents/skills/add-product/SKILL.md`). Tell the agent:

- product **name** (kebab-case)
- **url** (staging or `http://localhost:…`)
- **github** repo URL
- **jira** board / project URL

The skill scaffolds from `_template/`, runs smoke E2E, explores the UI, and **keeps asking the user** for missing credentials or context until exploration is complete (multi-turn). Updates `.env` and writes `KNOWLEDGE.md`.

Run smoke tests after onboarding:

```bash
npm run test:e2e -- --project=<name>
```

## Writing tests

- Use English for features, steps, and docs.
- `regression/` holds smoke / baseline tests (`*.feature` + `*.steps.ts` side by side).
- Ticket-specific tests: `<project>/<TICKET-ID>/` with the same layout — see [jira-to-e2e skill](skills/jira-to-e2e/SKILL.md).
- Before running or writing tests for a product, read `<project>/README.md` and `<project>/KNOWLEDGE.md`.
- Tag scenarios as needed, e.g. `@smoke`, `@regression`, plus the ticket key (`@BET-4344`).

## MCP prerequisites

Tests run without MCP. MCP helps when onboarding products or writing tests from Jira.

| MCP | Required for |
|-----|----------------|
| **Browser** | add-product UI exploration |
| **GitHub** | PRs, repo context, routes |
| **Atlassian (Jira)** | Tickets, JQL search |

**Your job:** if a required MCP is missing or failing, help the user set it up in their IDE (not in `.env`).

- **GitHub** — add GitHub MCP; user needs a [personal access token](https://github.com/settings/tokens) in IDE MCP settings (e.g. Cursor `.cursor/mcp.json`).
- **Jira** — enable Atlassian MCP in IDE; user completes OAuth once.

When writing tests for a ticket:

1. Read `<project>/README.md` and `<project>/KNOWLEDGE.md`.
2. Follow the **jira-to-e2e** skill (`.agents/skills/jira-to-e2e/SKILL.md`).
