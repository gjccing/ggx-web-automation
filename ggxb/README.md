# GGXB (B2B Website)

GoGoX B2B business portal — staging automation target for `gogovan/b2b-website`.

## Metadata (for agents)

| Field | Value |
|-------|-------|
| Project ID | `ggxb` |
| Env prefix | `GGXB` |
| Regions | `hk`, `sg` |
| Base URL env (per region) | `GGXB_HK_BASE_URL`, `GGXB_SG_BASE_URL` |
| B2B test account env | `GGXB_{HK\|SG}_TEST_USER_EMAIL`, `GGXB_{HK\|SG}_TEST_USER_PASSWORD` |
| BET-4367 low-wallet HK account | `GGXB_HK_BET_4367_USER_EMAIL`, `GGXB_HK_BET_4367_USER_PASSWORD` |
| BET-4503 notification time HK account | `GGXB_HK_BET_4503_USER_EMAIL`, `GGXB_HK_BET_4503_USER_PASSWORD` |
| Driver app test account env | `GGXB_{HK\|SG}_DA_USER_PHONE`, `GGXB_{HK\|SG}_DA_USER_PASSWORD` |
| GitHub repo | `gogovan/b2b-website` |
| GitHub URL | `https://github.com/gogovan/b2b-website` |
| Jira project key | `BET` |
| Jira URL | `https://gogotech.atlassian.net/browse/BET` |

## Environment

Set in the repo root `.env` (see `.env.example` for placeholders):

```bash
# Base URLs (per region)
GGXB_BASE_URL=https://hk-b2b-stag.gogox.com/          # legacy HK alias
GGXB_HK_BASE_URL=https://hk-b2b-stag.gogox.com/
GGXB_SG_BASE_URL=https://sg-b2b-stag.gogox.com/

# B2B portal test accounts
GGXB_HK_TEST_USER_EMAIL=
GGXB_HK_TEST_USER_PASSWORD=
GGXB_SG_TEST_USER_EMAIL=
GGXB_SG_TEST_USER_PASSWORD=

# Driver app test accounts
GGXB_HK_DA_USER_PHONE=
GGXB_HK_DA_USER_PASSWORD=
GGXB_SG_DA_USER_PHONE=
GGXB_SG_DA_USER_PASSWORD=
```

`GGXB_BASE_URL` remains supported as a legacy HK alias when `GGXB_HK_BASE_URL` is unset. Credential values are secrets — keep them in `.env` only.

## Test layout

```
regression/
  smoke/
    index.feature       # HTTP / title load check
    visual.feature      # full-page UI screenshot comparison (@visual)
    *.steps.ts
snapshots/              # committed Playwright visual baselines
<ticket-id>/
  *.feature
  *.steps.ts
```

Run smoke tests:

```bash
npm run test:e2e -- --project=ggxb
npm run test:e2e -- --project=ggxb --grep @hk
npm run test:e2e -- --project=ggxb --grep @sg
```

Visual smoke (screenshot baselines under `ggxb/snapshots/`):

```bash
npm run test:e2e -- --project=ggxb --grep @visual
npm run test:e2e -- --project=ggxb --grep "@visual @hk"
```

Also covers the transport place-order wizard (route → order details → summary, without Place order) and one Completed transport/delivery order detail.

After intentional UI changes, refresh baselines against the same env as `.env`:

```bash
npm run test:e2e:update-snapshots -- --project=ggxb --grep @visual
```
