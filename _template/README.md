# Product template

Use `npm run add-product` to scaffold a new product interactively.

## Metadata (for agents)

| Field | Value |
|-------|-------|
| Project ID | `<project-name>` |
| GitHub repo | `owner/repo` |
| GitHub URL | `https://github.com/owner/repo` |
| Jira project key | `XXX` |
| Jira URL | `https://gogotech.atlassian.net/jira/software/c/projects/BET/boards/87` |

## Environment

Set in the repo root `.env`:

```bash
# Rename TEMPLATE_BASE_URL to <PROJECT>_BASE_URL when importing, e.g. B2B_BASE_URL
TEMPLATE_BASE_URL=https://example.com
```

Update `regression/steps/smoke.steps.ts` to use your env var name.

## Test layout

```
regression/
  *.feature
  steps/
```
