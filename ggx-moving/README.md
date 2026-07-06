# GGX Moving

GoGoX Moving consumer website — staging automation target for `gogovan/gogox-moving`.

## Metadata (for agents)

| Field | Value |
|-------|-------|
| Project ID | `ggx-moving` |
| Env prefix | `GGX_MOVING` |
| Base URL env | `GGX_MOVING_BASE_URL` |
| GitHub repo | `gogovan/gogox-moving` |
| GitHub URL | `https://github.com/gogovan/gogox-moving` |
| Jira project key | `BET` |
| Jira URL | `https://gogotech.atlassian.net/jira/software/c/projects/BET` |

## Environment

Set in the repo root `.env` (see `.env.example` for placeholders):

```bash
GGX_MOVING_BASE_URL=https://staging-gogox-moving.vercel.app/en-HK
```

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
npm run test:e2e -- --project=ggx-moving
```
