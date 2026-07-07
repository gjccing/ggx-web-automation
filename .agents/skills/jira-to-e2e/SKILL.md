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
| **Browser MCP** | Reproduce flows, capture selectors, confirm trigger path — **only after user provides steps or explicitly asks you to explore** |
| **Shell** | `bddgen`, `npm run test:e2e` |
| **AskQuestion** | **First** for how to reach the feature; also for missing URL, credentials, or deployment status |

## 1. Inputs

Required (from message or `AskQuestion`):

| id | prompt |
|----|--------|
| `jira` | Jira issue URL or key (e.g. `BET-4377`) |
| `project` | Product folder (`ggxb`, `ggx-moving`, …) — infer from ticket project key + `<project>/README.md` when possible |

Optional (if already in the user message, skip asking):

- **Trigger steps** — how to reach and verify the behaviour (page, clicks, inputs, expected UI)
- **Current page** — user has a browser tab open; use Browser MCP `browser_tabs` + `browser_snapshot` on that URL
- **Region / locale** — e.g. HK zh-HK, SG en

Parse ticket key: `/browse/([A-Z]+-\d+)/` or bare `KEY-123`.

## 2. Read context (lightweight — no UI exploration yet)

1. `<project>/README.md` — env prefix, regions, Jira mapping
2. `<project>/KNOWLEDGE.md` — flows, roles, selectors
3. Existing ticket tests under `<project>/<TICKET>/` and `<project>/regression/` — reuse steps and page objects
4. **Jira** — `getJiraIssue` with `responseContentFormat: "markdown"`; fields: summary, description, acceptance criteria, labels

`cloudId`: pass Jira hostname (e.g. `gogotech.atlassian.net`); fall back to `getAccessibleAtlassianResources`.

**Stop here.** Do not open Browser MCP, run Playwright, or write exploratory scripts until step 3 is satisfied.

## 3. Ask user for trigger steps (required unless already provided)

**Always call `AskQuestion` first** (`title: "Jira → E2E — 需要你的協助"`) when the user has **not** already described how to reach and verify the feature.

Ask in one form covering:

| id | prompt | options (examples) |
|----|--------|-------------------|
| `trigger` | 如何觸發並驗證這個功能？ | 我會在下一則訊息描述步驟 · 我已在瀏覽器開好頁面 · 請你自己探索 staging |
| `region` | 哪個市場 / 語言？（若 Jira 未指明） | HK 繁中 · HK English · SG · 其他 |
| `env` | 測試環境與帳號 | 已在 `.env` · 我會提供帳密 · 功能尚未部署 |

**Skip `AskQuestion` only when** the user's message already includes enough detail, e.g.:

- Explicit step-by-step instructions
- "I'm on `/van/order` with the dialog open"
- "Explore staging yourself" / "你自己探索"

**After `AskQuestion` — stop and wait.** Do not guess flows, credentials, or URLs.

### When user says "explore yourself"

Only then: Browser MCP or Playwright to reproduce the flow, capture selectors, and confirm assertions. Still prefer repo/Jira text over invented steps.

## 4. Design scenarios

Map acceptance criteria + **user-provided steps** → Gherkin scenarios. Rules:

- English for feature titles, steps, and code
- Tag feature with `@<TICKET>` plus domain tags (`@hk`, `@smoke`, …)
- Prefer reusing shared steps (`regression/common/*.steps.ts`, existing `Given`/`When`/`Then`)
- New page logic → `<project>/lib/pages/<area>.ts`; ticket-only data → `<project>/lib/test-data/<ticket>.ts`
- Do not invent flows not seen in user steps, browser, repo, or ticket text

## 5. Scaffold files

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

## 6. Run the new test

```bash
npm run bdd:gen
npm run test:e2e -- --project=<project> --grep @<TICKET>
```

- Fix failures before proceeding; re-run until green.
- If env vars missing, `AskQuestion` — never commit secrets.
- On failure: report error + screenshot/trace path; **do not** comment on Jira.

## 7. Comment on Jira (success only)

When **all** scenarios for `@<TICKET>` pass:

1. Read the `.feature` file(s) under `<project>/<TICKET>/`.
2. Post via `addCommentToJiraIssue`:
   - `cloudId`: same as step 2
   - `issueIdOrKey`: ticket key
   - `contentFormat`: `markdown`
   - `commentBody`: use [comment template](comment-template.md)

Include every scenario from the feature file(s). Mention the steps file path for implementers; do not paste full `.steps.ts` unless the user asks.

## 8. Done

Summarize for the user:

- Ticket key + product
- Files created/updated
- Test command + result
- Jira comment posted (link or confirmation)

## Do not

- **Start browser exploration or write tests before asking for trigger steps** (unless user already provided them or said to explore)
- Comment on Jira before tests pass
- Duplicate regression coverage already in `<project>/regression/`
- Hard-code secrets in feature/steps files
- Skip reading `README.md` / `KNOWLEDGE.md`
- End a turn needing user input without `AskQuestion`

## Additional resources

- Jira comment format: [comment-template.md](comment-template.md)
- Example ticket layout: `ggxb/BET-4377/`, `ggxb/BET-4372/`
