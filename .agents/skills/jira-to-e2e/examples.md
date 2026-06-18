# Examples

## Full ticket

**User message**

> https://gogotech.atlassian.net/browse/BET-4344

**Agent actions**

1. Parse `BET-4344` → project key `BET` → `b2b-website/`
2. `getJiraIssue` for full description + AC
3. Ignore "Phase 2", "nice to have", analytics-only items
4. Create:

```text
b2b-website/BET-4344/
  login-redirect.feature
  steps/
    login-redirect.steps.ts
```

**Feature snippet**

```gherkin
@BET-4344 @regression
Feature: Login redirect after session expiry

  Scenario: Unauthenticated user is sent to login
    Given I am logged out on the B2B website
    When I open the orders page
    Then I should see the login page
```

## Comment thread only

**User message**

> https://gogotech.atlassian.net/browse/BET-4121?focusedCommentId=192482

**Agent actions**

1. Parse `BET-4121` + `focusedCommentId=192482`
2. Fetch issue comments; scope to comment `192482` and its replies only
3. Ignore the rest of BET-4121 description unless one line of context is needed
4. Create `b2b-website/BET-4121/` with features covering **only** what that thread specifies

## Ambiguous product

If `BET-4344` matched two products' Jira keys, ask:

> Which product should these tests live under? `b2b-website` or `other-product`?
