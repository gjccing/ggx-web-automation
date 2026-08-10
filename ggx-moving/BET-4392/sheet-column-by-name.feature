@BET-4392 @exclusive-sheet @hk @moving
Feature: BET-4392 Reference Moving Orders sheet columns by name

  The order-write API resolves target columns by header name. Mutating the
  shared Moving Orders sheet requires workers=1 and must not run in parallel
  with other sheet-writing scenarios. Columns are restored after the scenario.

  Background:
    Given a fresh GGX Moving test run
    And Moving Orders sheet column mutations require a single Playwright worker

  Scenario: Order fields land under correct headers after columns are reordered
    Given I swap Moving Orders sheet columns "起點" and "終點"
    When I open the GGX Moving homepage with query "?utm_medium=e2e&utm_source=automation&utm_campaign=std-moving&utm_content=submit"
    And I select the "standard" service on the homepage
    And I click the homepage call to action
    And I complete the standard moving quote flow
    Then the "std-moving" session should be cleared after submit
    And the latest Google Sheet row for the order should match the submitted standard moving details
    And the order from and to sheet cells at canonical indexes should reflect the column swap
