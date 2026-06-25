# GGXB (B2B Website)

GoGoX B2B business portal — staging automation target for `gogovan/b2b-website`.

## Metadata (for agents)

| Field | Value |
|-------|-------|
| Project ID | `ggxb` |
| Env prefix | `GGXB` |
| Regions | `hk`, `sg` |
| Base URL env (per region) | `GGXB_HK_BASE_URL`, `GGXB_SG_BASE_URL` |
| GitHub repo | `gogovan/b2b-website` |
| GitHub URL | `https://github.com/gogovan/b2b-website` |
| Jira project key | `BET` |
| Jira URL | `https://gogotech.atlassian.net/browse/BET` |

## Environment

Set in the repo root `.env`:

```bash
GGXB_HK_BASE_URL=https://hk-b2b-stag.gogox.com/
GGXB_SG_BASE_URL=https://sg-b2b-stag.gogox.com/
```

`GGXB_BASE_URL` remains supported as a legacy HK alias.

## Test layout

```
regression/
  smoke/
    index.feature
    index.steps.ts
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
