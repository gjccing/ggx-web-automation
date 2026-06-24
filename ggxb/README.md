# GGXB (B2B Website)

GoGoX B2B business portal — staging automation target for `b2b-website`.

## Metadata (for agents)

| Field | Value |
|-------|-------|
| Project ID | `ggxb` |
| Env prefix | `GGXB` |
| Base URL env | `GGXB_BASE_URL` |
| GitHub repo | `gogovan/b2b-website` |
| GitHub URL | `https://github.com/gogovan/b2b-website` |
| Jira project key | `BET` |
| Jira URL | `https://gogotech.atlassian.net/browse/BET` |

## Environment

Set in the repo root `.env`:

```bash
GGXB_BASE_URL=https://hk-b2b-stag.gogox.com/
```

## Test layout

```
regression/
  smoke.feature
  smoke.steps.ts
<ticket-id>/
  *.feature
  *.steps.ts
```
