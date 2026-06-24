---
name: add-product
description: >-
  Onboard a product: collect name/url/github/jira via AskQuestion, scaffold from
  _template/, run smoke, explore UI, write KNOWLEDGE.md. Ask again via AskQuestion
  only when exploration is blocked. Use for add-product or onboarding a new project.
---

# Add product

Scaffold from `_template/`, verify smoke, explore the UI, persist env vars, write `KNOWLEDGE.md`.

**Do not** use `npm run add-product` — removed. **No scaffold script** — copy and patch manually.

## Tools

| Tool | Use |
|------|-----|
| Shell | `cp`, edits, `bddgen`, `playwright test` |
| Browser MCP | UI exploration |
| GitHub / Atlassian MCP | Optional context from repo or Jira URL |

## 1. Required inputs (`AskQuestion`)

First response: call `AskQuestion` (`title: "Add product — 必填資訊"`). **Only these four questions** (omit any field already in the user's message):

| id | prompt |
|----|--------|
| `name` | 產品名稱（kebab-case） |
| `url` | Base URL（`http://` 或 `https://`） |
| `github` | GitHub repo URL |
| `jira` | Jira board / project URL |

Options per missing field: `paste_next` 下一則訊息提供 · `provided_above` 已在對話中提供

If any answer needs a follow-up message, **stop and wait** — do not scaffold that turn.

Validate before scaffold:

- `name`: `^[a-z0-9]+(-[a-z0-9]+)*$`; not `_template`, `.agents`, `lib`
- `url`: valid `http://` or `https://`
- GitHub URL → `owner/repo`
- Jira URL → project key from `/projects/KEY/` or `/browse/KEY-123`; if unparseable, `AskQuestion` again later

**Resume:** folder `<name>/` exists → skip scaffold; read `<name>/KNOWLEDGE.md`, continue exploration.

Use `AskQuestion` for user input — not a markdown table. Free-text secrets: **下一則訊息提供**; never invent values.

## Env vars

```
PREFIX = name → SCREAMING_SNAKE (b2b-website → B2B_WEBSITE)
{PREFIX}_BASE_URL
{PREFIX}_{SUFFIX}  e.g. B2B_WEBSITE_TEST_USER_EMAIL
```

Real values → `.env`. Placeholders / comments → `.env.example` only. Upsert by replacing the line or appending.

## 2. Scaffold

Skip if `<name>/` exists.

```bash
cp -R _template <name>
```

Patch:

- `<name>/README.md` — metadata table (project id, prefix, base URL env, GitHub, Jira)
- `<name>/regression/smoke.steps.ts` — `TEMPLATE_BASE_URL` → `{PREFIX}_BASE_URL`
- `.env` / `.env.example` — `{PREFIX}_BASE_URL=<url>`

Layout:

```
<name>/
  README.md
  regression/
    smoke.feature
    smoke.steps.ts
```

No `regression/steps/` subfolder.

## 3. Smoke (gate)

```bash
npm run bdd:gen
npm run test:e2e -- --project=<name>
```

Must pass before exploration. On failure: `AskQuestion` with options that match what you observed, then fix and re-run.

## 4. Explore

Browser MCP from `{PREFIX}_BASE_URL`. Document what you see in `KNOWLEDGE.md` ([template](KNOWLEDGE.template.md)).

Optional: GitHub MCP for routes / `data-testid`.

## 5. Blocked → `AskQuestion`

When exploration cannot continue, call `AskQuestion` in the **same turn** (`title: "Add product — 需要你的協助"`). Describe the blocker (page, URL, what you tried). Options should fit **that** situation; include 下一則訊息提供 for secrets.

After the user replies: write vars to `.env`, placeholder to `.env.example`, resume exploration, update `KNOWLEDGE.md`.

Do not end the turn needing user input without `AskQuestion`.

## 6. Done

When exploration is finished or the user says stop: brief summary (folder, env var **names**, smoke result, `KNOWLEDGE.md` highlights).

## Do not

- Ask anything beyond the four required fields before scaffold
- Skip smoke before exploration
- Commit secrets to `.env.example` or `KNOWLEDGE.md`
- Invent flows not observed in browser or repo
- Add scaffolding scripts unless the user asks
