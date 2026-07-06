@regression @std-moving
Feature: Standard moving quote flow

  Background:
    Given a fresh GGX Moving test run
    And I open the GGX Moving homepage
    And I select the "standard" service on the homepage
    And I click the homepage call to action

  Scenario: Move details validates required fields
    When I submit the move details step without filling required fields
    Then the move details validation errors should be shown

  Scenario: Move details persists in session storage after reload
    When I fill the standard moving move details step
    And I reload the GGX Moving page
    Then the "std-moving" session should contain saved move details

  Scenario: Wizard step guard redirects when session is incomplete
    When I try to open wizard step "items-to-move" without completing move details
    Then I should be redirected to the standard moving move details step

  Scenario: Submit standard moving order and verify Google Sheet row
    When I open the GGX Moving homepage with query "?utm_medium=e2e&utm_source=automation&utm_campaign=std-moving&utm_content=submit"
    And I select the "standard" service on the homepage
    And I click the homepage call to action
    And I complete the standard moving quote flow
    Then the "std-moving" session should be cleared after submit
    And the latest Google Sheet row for the order should match the submitted standard moving details
