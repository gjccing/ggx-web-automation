---
name: add-product
description: >-
  Scaffold a new product from _template/, verify smoke E2E passes, explore the
  UI with the browser, collect env vars, and write KNOWLEDGE.md. Keeps asking
  the user for missing info until exploration is complete. Use when the user
  asks to add a product, onboard a new project, or run add-product.
---

# Add product

Onboard a new product into ggx-web-automation: scaffold from `_template/`, verify Playwright smoke, explore the UI, persist env vars, and write `KNOWLEDGE.md`.

**Do not** use `npm run add-product` — that command was removed. Follow this skill.

## Prerequisites

| Tool | Required for |
|------|----------------|
| Shell | `cp`, file edits, `bddgen`, `playwright test` |
| **Browser MCP** (`cursor-ide-browser`) | Page exploration |
| **GitHub MCP** | Optional — routes, components, `data-testid` from `{owner/repo}` |
| **Atlassian MCP** | Optional — Jira project context from board URL |

## Required inputs

Collect from the user before scaffolding. **Ask if any are missing.**

| Input | Rules | Example |
|-------|-------|---------|
| **name** | kebab-case; not reserved (`_template`, `.agents`, `lib`) | `b2b-website` |
| **url** | `http://` or `https://`; user may set `http://localhost:3000` | `https://hk-b2b-stag.gogox.com` |
| **github** | GitHub repo URL | `https://github.com/gogovan/b2b-website` |
| **jira** | Jira board / project / ticket URL | `https://gogotech.atlassian.net/jira/software/c/projects/BET/boards/87` |

If Jira project key cannot be parsed from the URL, ask for it (e.g. `BET`).

Show a summary and confirm before scaffolding.

## Env naming convention

```
PREFIX = name with hyphens → underscores, uppercased
         b2b-website → B2B_WEBSITE

Base URL:  {PREFIX}_BASE_URL
Extra vars: {PREFIX}_{SUFFIX}   e.g. B2B_WEBSITE_TEST_ADMIN_EMAIL
```

Write real values to `.env`. Write placeholders or comments to `.env.example` — **never commit secrets**.

**Upsert env vars:** if the key already exists in the file, replace that line; otherwise append. No helper script — edit `.env` / `.env.example` directly.

**Parse inputs:**

- **GitHub URL** → `owner/repo` (strip `.git`, trailing slash)
- **Jira URL** → project key from `/projects/KEY/` or `/browse/KEY-123`; ask user if not parseable

## Workflow overview

Phases 1–3 run once. Phases 4–6 **loop** until exploration is complete. Phase 7 runs only when done.

```
1. Collect & confirm inputs
2. Scaffold from _template
3. Smoke test (gate)
       ↓
   ┌──► 4. Explore UI in browser
   │         ↓
   │    blocked or incomplete?
   │         ↓ yes
   │    5. Ask user → persist .env → wait for reply
   │         ↓
   │    6. Update KNOWLEDGE.md (incremental)
   │         │
   └─────────┘ loop
       ↓ no (checklist complete)
7. Final summary
```

---

## Exploration is not done until you ask

**Critical rule:** If exploration is blocked or incomplete, you **must ask the user** in the same turn — do **not** end with only a passive "suggested next step".

| ❌ Wrong | ✅ Right |
|----------|----------|
| "登入後流程未探索，建議提供帳號" then stop | "登入後流程需要測試帳號才能繼續。請提供 `{PREFIX}_TEST_USER_EMAIL` 和密碼（或告訴我 1Password 項目名稱），我會寫入 `.env` 並繼續探索。" |
| Write KNOWLEDGE.md with large "Not explored" sections and finish | Ask for what's missing, **wait for user reply**, then re-explore and update KNOWLEDGE.md |
| Assume credentials or skip gated areas | Stop at the gate, ask, resume after user responds |

**Keep asking** across multiple conversation turns until the exploration checklist below is satisfied, or the user explicitly says **stop** / **good enough**.

When resuming in a later turn (`/add-product <name>` on an existing product): read `<name>/KNOWLEDGE.md`, find unchecked / blocked items, ask for what's still missing, continue the loop.

---

## Exploration checklist

Track mentally (or list in reply). Ask the user whenever an item is blocked.

| # | Goal | Done when |
|---|------|-----------|
| 1 | Public / unauthenticated pages | Login, signup, recovery, language switch documented |
| 2 | Auth gate identified | Know what credentials or SSO is required |
| 3 | Post-login landing | Dashboard or home after login observed |
| 4 | Main navigation | Top-level nav items and paths recorded |
| 5 | Core business flow(s) | At least one primary journey walked (e.g. view orders, create order) |
| 6 | Role differences | If multiple roles exist, note what differs — ask for extra accounts |
| 7 | UI conventions | Locators, `data-testid`, form labels worth reusing in tests |
| 8 | Blockers resolved or documented | VPN, 2FA, captcha — ask user how to handle |

Minimum to finish: items **1–2** always; **3–5** required if the product has a login wall (ask for credentials until explored); **6–8** as applicable.

---

### 1. Collect & confirm

Validate:

- `name` matches `^[a-z0-9]+(-[a-z0-9]+)*$`
- `url` is valid http(s)
- Product folder `<name>/` does **not** already exist (skip scaffold if resuming — folder exists)

---

### 2. Scaffold

Skip if `<name>/` already exists (resume mode).

Do this manually — **no scaffold script**. Copy `_template/` and patch files:

**2a. Copy template**

```bash
cp -R _template <name>
```

**2b. Write `<name>/README.md`**

```markdown
# <name>

## Metadata (for agents)

| Field | Value |
|-------|-------|
| Project ID | `<name>` |
| Env prefix | `<PREFIX>` |
| Base URL env | `<PREFIX>_BASE_URL` |
| GitHub repo | `<owner/repo>` |
| GitHub URL | <github-url> |
| Jira project key | `<KEY>` |
| Jira URL | <jira-url> |

## Environment

Set in the repo root `.env`:

\`\`\`bash
<PREFIX>_BASE_URL=<url>
\`\`\`

See `KNOWLEDGE.md` for product flows, roles, and additional env vars.

## Test layout

\`\`\`
regression/
  *.feature
  *.steps.ts
<ticket-id>/
  *.feature
  *.steps.ts
\`\`\`
```

**2c. Patch `<name>/regression/smoke.steps.ts`**

Replace every `TEMPLATE_BASE_URL` with `<PREFIX>_BASE_URL`. Update the comment to name the product.

**2d. Upsert `.env` and `.env.example`**

Add or update line: `<PREFIX>_BASE_URL=<url>`

If `.env` does not exist, copy from `.env.example` first.

**Template layout** (do not change):

```
<name>/
  README.md
  regression/
    smoke.feature
    smoke.steps.ts
```

---

### 3. Verify smoke (gate)

Do **not** start exploration until smoke passes.

```bash
npm run bdd:gen
npm run test:e2e -- --project=<name>
```

On failure: ask user to confirm URL / VPN / localhost, fix, re-run until green.

---

### 4. Explore UI

Use **Browser MCP** (`browser_navigate` → `browser_lock` → interact → `browser_unlock`).

Start at `{PREFIX}_BASE_URL` from `.env`. Work through the **exploration checklist**.

**Optional:** GitHub MCP on `{owner/repo}` — routes, components, test ids.

**Do not guess credentials.** Hit a login wall → go to phase 5 immediately and **ask the user** before ending the turn.

---

### 5. Ask user & persist env vars (loop entry)

Whenever exploration is blocked, **ask in this turn** and list exactly what you need.

| Situation | Ask user | Env var example |
|-----------|----------|-----------------|
| Login required | test account email / password | `{PREFIX}_TEST_USER_EMAIL`, `{PREFIX}_TEST_USER_PASSWORD` |
| Multiple roles | one account per role | `{PREFIX}_TEST_ADMIN_EMAIL`, `{PREFIX}_TEST_VIEWER_EMAIL`, … |
| API key / token | key or where to find it | `{PREFIX}_API_KEY` |
| VPN / network | confirm VPN on or alternate URL | update `{PREFIX}_BASE_URL` |
| 2FA / captcha | how QA bypasses in staging | note in KNOWLEDGE.md; ask for backup account |
| Unclear product area | "which flow matters most next?" | prioritise checklist item 5 |

For each new var:

1. Add real value to `.env` (after user provides it — not before)
2. Add placeholder to `.env.example` (comments only for secrets)
3. **Resume phase 4** — re-explore with new access
4. Update KNOWLEDGE.md (phase 6)

**One question batch per blocker** is fine, but do not skip asking. If multiple blockers exist, list them all.

---

### 6. Write / update KNOWLEDGE.md

Create or update `<name>/KNOWLEDGE.md` from [KNOWLEDGE.template.md](KNOWLEDGE.template.md).

- After each exploration round, merge new findings
- Move items from "Not explored" to documented flows as you go
- Keep a short **Exploration progress** section until complete:

  ```markdown
  ## Exploration progress
  - [x] Public auth pages
  - [x] Login flow
  - [ ] Post-login navigation  ← blocked: need viewer account
  ```

Remove or collapse the progress section when checklist is complete.

---

### 7. Final summary (only when exploration is complete)

Run this **only when**:

- Exploration checklist is satisfied, **or**
- User explicitly says stop / good enough

Include:

- Product folder path
- Env vars added (names only — not secret values)
- Smoke test result
- KNOWLEDGE.md highlights (roles, core flows)
- Suggested regression tests to add next

If checklist is **not** complete and user did not say stop → **go back to phase 5 and ask**; do not use phase 7 as a way to exit early.

---

## Examples

**First turn — hits login wall:**

> Smoke 通過。已記錄 `/login`、`/signup`、`/recovery`。
> 要繼續探索 dashboard 和主導航，需要 staging 測試帳號。
> 請提供 email 和密碼（或 1Password 項目名稱），我會寫入 `GGXB_TEST_USER_*` 並繼續。

**Second turn — user provides credentials:**

> 已寫入 `.env`。正在登入並探索主導航…（phase 4 繼續）

**Third turn — needs second role:**

> 已記錄 admin 視圖。是否有 **viewer** 唯讀帳號？需要比對權限差異才能完成探索。

**Resume:**

> `/add-product ggxb` → read `ggxb/KNOWLEDGE.md` → see blocked items → ask → continue loop

## Do not

- End the turn with incomplete exploration without asking the user
- Skip the smoke gate before exploration
- Commit passwords or API keys to `.env.example` or KNOWLEDGE.md
- Invent product flows not observed in browser or GitHub/Jira
- Use the removed `npm run add-product` command
- Add repo scripts for scaffolding unless the user explicitly asks
- Create `regression/steps/` subfolder — steps live beside features (`*.steps.ts`)
- Treat "Suggested next steps" as a substitute for phase 5 questions
