---
name: jira-to-e2e
description: >-
  Scaffold Playwright-BDD E2E tests from Jira tickets or comment threads.
  Ignores advanced scope and PM wishlist items. Creates <project>/<TICKET-ID>/
  with .feature files and steps/. Use when the user shares a Jira browse URL,
  asks to write E2E tests from a ticket, or mentions BET-XXXX.
---

# Jira → E2E

Create Gherkin features and step definitions from Jira. **Ignore advanced scope and PM wishlist content** — only implement what is clearly testable in the current release.

## Input formats

| Format | Example | Scope |
|--------|---------|--------|
| Full ticket | `https://gogotech.atlassian.net/browse/BET-4344` | Summary, description, acceptance criteria |
| Comment thread | `https://gogotech.atlassian.net/browse/BET-4121?focusedCommentId=192482` | That comment and its reply thread only |

Parse from URL:
- **Issue key**: `/browse/([A-Z][A-Z0-9]+-\d+)`
- **Focused comment** (optional): query param `focusedCommentId`

## Prerequisites

1. **Atlassian MCP** must work. If not, help the user enable it and complete OAuth (not in `.env`).
2. Resolve **cloudId**: try `gogotech.atlassian.net`; if that fails, call `getAccessibleAtlassianResources`.

## Workflow

```
- [ ] Parse URL → issue key (+ optional focusedCommentId)
- [ ] Resolve product folder from Jira project key
- [ ] Fetch Jira content (full ticket or comment thread)
- [ ] Extract testable requirements (filter noise)
- [ ] Scaffold <project>/<TICKET-ID>/ with .feature + steps/
- [ ] Run bddgen + targeted playwright test
```

### 1. Resolve product folder

Read each `<project>/README.md` at repo root. Match the ticket prefix (e.g. `BET` from `BET-4344`) to **Jira project key**. If no match or multiple matches, ask the user which product.

Record from that README: `Base URL env`, `GitHub repo` (for UI context if needed).

### 2. Fetch Jira content

```text
getJiraIssue({
  cloudId: "gogotech.atlassian.net",
  issueIdOrKey: "<TICKET-ID>",
  fields: ["summary", "description", "comment", "status", "issuetype"],
  responseContentFormat: "markdown"
})
```

**Full ticket** (no `focusedCommentId`): use summary, description, and any acceptance-criteria / test-related fields. Skim linked PRs via GitHub MCP only when selectors or flows are unclear.

**Comment thread** (`focusedCommentId` set):
1. Find the comment whose `id` equals `focusedCommentId`.
2. Include that comment plus all replies in the same thread (comments whose parent chain leads to that root).
3. Do **not** expand scope to the full ticket unless one line of context is required to understand the thread.

### 3. Filter — what to ignore

Drop or skip requirements that are:

- PM wishlist, ideas, or "would be nice"
- Marked advanced, future phase, out of scope, or dependency on unfinished work
- Purely visual polish without verifiable behaviour
- Internal-only or backend-only with no UI assertion path
- Duplicated smoke checks already in `regression/`

Keep:

- Explicit acceptance criteria and user-visible behaviour
- Clear given/when/then flows a browser can assert
- Data validations, error messages, navigation, permissions visible in UI

When unsure, prefer **fewer, concrete scenarios** over guessing.

### 4. Scaffold output

Create under the resolved product:

```text
<project>/<TICKET-ID>/
  <topic>.feature          # English; one file per logical area if needed
  steps/
    <topic>.steps.ts       # step defs for this ticket's features
```

Same layout as `regression/` (`*.feature` + `steps/`). Do **not** put files at the product root.

**Feature file rules**

- English only for Feature, Scenario, steps, tags
- Tag every scenario with the ticket key, e.g. `@BET-4344`
- Add `@regression` when appropriate
- One Scenario per testable behaviour; use Scenario Outline only when data-driven cases are explicit in Jira

**Step file rules**

- `import { createBdd } from 'playwright-bdd'` + `createBdd()`
- Use the product `Base URL env` from README (same pattern as `regression/steps/smoke.steps.ts`)
- Reuse existing step sentences from `regression/` when wording matches — duplicate step text is fine across files
- New steps live in this ticket's `steps/` folder
- Prefer role-based locators; avoid brittle CSS

### 5. Verify

```bash
npm run test:e2e -- --project=<project> --grep @<TICKET-ID>
```

Fix failures before finishing. If Jira lacks enough detail to implement, list **assumptions** and **blocked scenarios** in the reply — do not invent PM scope.

## Examples

See [examples.md](examples.md).
