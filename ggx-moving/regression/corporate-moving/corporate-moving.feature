@regression @corporate-moving
Feature: Corporate moving quote flow

  Background:
    Given a fresh GGX Moving test run
    And I open the GGX Moving homepage
    And I select the "corporate" service on the homepage
    And I click the homepage call to action

  Scenario: Corporate moving form validates required fields
    When I submit the corporate moving form without filling required fields
    Then the corporate moving validation errors should be shown

  Scenario: Corporate moving form persists after reload
    When I fill the corporate moving form except contact fields
    And I reload the GGX Moving page
    Then the "corporate-moving-services" session should contain saved form data

  Scenario: Submit corporate moving order and verify Google Sheet row
    When I complete the corporate moving quote flow
    Then the "corporate-moving-services" session should be cleared after submit
    And the latest Google Sheet row for the order should match the submitted corporate moving details
