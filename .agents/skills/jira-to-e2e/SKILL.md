---
name: jira-to-e2e
description: >-
  Turn a Jira ticket and live page state into playwright-bdd E2E tests, run them,
  and post the feature file to Jira on success. Use when the user shares a Jira
  browse URL, asks to write ticket tests, automate acceptance criteria, or run
  BET-/ticket-scoped BDD scenarios.
---

# Jira → E2E

Write ticket-scoped BDD tests from a Jira issue + observed UI, run them, comment on Jira when green.

## Tools

| Tool | Use |
|------|-----|
| **Atlassian MCP** | `getJiraIssue`, `addCommentToJiraIssue`; `getAccessibleAtlassianResources` if `cloudId` fails |
| **Browser MCP** | Reproduce flows, capture selectors, confirm trigger path for the new feature |
| **Shell** | `bddgen`, `npm run test:e2e` |
| **AskQuestion** | Missing page URL, credentials, or how to reach the feature |

## 1. Inputs

Required (from message or `AskQuestion`):

| id | prompt |
|----|--------|
| `jira` | Jira issue URL or key (e.g. `BET-4377`) |
| `project` | Product folder (`ggxb`, `ggx-moving`, …) — infer from ticket project key + `<project>/README.md` when possible |

Optional:

- **Current page** — user has a browser tab open; use Browser MCP `browser_tabs` + `browser_snapshot` on that URL.
- **Trigger hints** — user describes how to reach the new behaviour.

Parse ticket key: `/browse/([A-Z]+-\d+)/` or bare `KEY-123`.

## 2. Read context (before writing)

1. `<project>/README.md` — env prefix, regions, Jira mapping
2. `<project>/KNOWLEDGE.md` — flows, roles, selectors
3. Existing ticket tests under `<project>/<TICKET>/` and `<project>/regression/` — reuse steps and page objects
4. **Jira** — `getJiraIssue` with `responseContentFormat: "markdown"`; fields: summary, description, acceptance criteria, labels

`cloudId`: pass Jira hostname (e.g. `gogotech.atlassian.net`); fall back to `getAccessibleAtlassianResources`.

## 3. Design scenarios

Map acceptance criteria → Gherkin scenarios. Rules:

- English for feature titles, steps, and code
- Tag feature with `@<TICKET>` plus domain tags (`@hk`, `@smoke`, …)
- Prefer reusing shared steps (`regression/common/*.steps.ts`, existing `Given`/`When`/`Then`)
- New page logic → `<project>/lib/pages/<area>.ts`; ticket-only data → `<project>/lib/test-data/<ticket>.ts`
- Do not invent flows not seen in browser, repo, or ticket text

### Blocked → `AskQuestion`

Call `AskQuestion` (`title: "Jira → E2E — 需要你的協助"`) when you cannot reach or verify the feature:

| Situation | Example options |
|-----------|-----------------|
| Unknown entry URL | 提供 staging URL · 我已在瀏覽器開好（描述 tab） |
| Auth / secrets | 下一則訊息提供帳密 · 已在 `.env` |
| How to trigger feature | 描述操作步驟 · 提供截圖/錄影 · 功能尚未部署 |

Stop and wait after `AskQuestion` — do not guess credentials or URLs.

## 4. Scaffold files

```
<project>/<TICKET>/
  <slug>.feature      # human-readable slug from summary
  <slug>.steps.ts
```

Feature skeleton:

```gherkin
@<TICKET> @<domain-tags>
Feature: <TICKET> <short summary from Jira>

  Scenario: <outcome from acceptance criteria>
    Given ...
    When ...
    Then ...
```

Import shared steps in `.steps.ts` only for ticket-specific bindings; keep reusable logic in `lib/`.

## 5. Run the new test

```bash
npm run bdd:gen
npm run test:e2e -- --project=<project> --grep @<TICKET>
```

- Fix failures before proceeding; re-run until green.
- If env vars missing, `AskQuestion` — never commit secrets.
- On failure: report error + screenshot/trace path; **do not** comment on Jira.

## 6. Comment on Jira (success only)

When **all** scenarios for `@<TICKET>` pass:

1. Read the `.feature` file(s) under `<project>/<TICKET>/`.
2. Post via `addCommentToJiraIssue`:
   - `cloudId`: same as step 2
   - `issueIdOrKey`: ticket key
   - `contentFormat`: `markdown`
   - `commentBody`: use [comment template](comment-template.md)

Include every scenario from the feature file(s). Mention the steps file path for implementers; do not paste full `.steps.ts` unless the user asks.

## 7. Done

Summarize for the user:

- Ticket key + product
- Files created/updated
- Test command + result
- Jira comment posted (link or confirmation)

## Do not

- Comment on Jira before tests pass
- Duplicate regression coverage already in `<project>/regression/`
- Hard-code secrets in feature/steps files
- Skip reading `README.md` / `KNOWLEDGE.md`
- End a turn needing user input without `AskQuestion`

## Additional resources

- Jira comment format: [comment-template.md](comment-template.md)
- Example ticket layout: `ggxb/BET-4377/`, `ggxb/BET-4372/`
