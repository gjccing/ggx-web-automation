# Jira comment template

Use this body for `addCommentToJiraIssue` after tests pass. Replace placeholders.

```markdown
## E2E test added ✅

Automated coverage for this ticket is in the repo:

- **Project:** `<project>`
- **Path:** `<project>/<TICKET>/`
- **Run:** `npm run test:e2e -- --project=<project> --grep @<TICKET>`

### Feature file

```gherkin
<paste full contents of *.feature file(s) — no omissions>
```

### Steps

Implemented in `<project>/<TICKET>/<slug>.steps.ts` (reuses shared steps from `<project>/regression/` where applicable).
```

If multiple `.feature` files exist, repeat the `### Feature file` section for each.
