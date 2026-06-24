# Product template

Copied by the **add-product** agent skill (`.agents/skills/add-product/SKILL.md`).

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
# Renamed on scaffold: TEMPLATE_BASE_URL → <PREFIX>_BASE_URL
TEMPLATE_BASE_URL=https://example.com
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
