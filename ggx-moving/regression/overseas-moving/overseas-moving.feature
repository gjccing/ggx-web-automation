@regression @overseas-moving
Feature: Overseas moving quote flow

  Background:
    Given a fresh GGX Moving test run
    And I open the GGX Moving homepage
    And I select the "overseas" service on the homepage
    And I click the homepage call to action

  Scenario: Overseas moving form validates required fields
    When I submit the overseas moving form without filling required fields
    Then the overseas moving validation errors should be shown

  Scenario: Overseas moving form persists after reload
    When I fill the overseas moving form except contact fields
    And I reload the GGX Moving page
    Then the "overseas-moving" session should contain saved form data

  Scenario: Submit overseas moving order and verify Google Sheet row
    When I complete the overseas moving quote flow
    Then the "overseas-moving" session should be cleared after submit
    And the latest Google Sheet row for the order should match the submitted overseas moving details
