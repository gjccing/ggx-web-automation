@regression @disposal-only
Feature: Disposal only quote flow

  Background:
    Given a fresh GGX Moving test run
    And I open the GGX Moving homepage
    And I select the "disposal" service on the homepage
    And I click the homepage call to action

  Scenario: Disposal details validates required fields
    When I submit the disposal details step without filling required fields
    Then the disposal details validation errors should be shown

  Scenario: Disposal details persists after reload
    When I fill the disposal moving move details step
    And I reload the GGX Moving page
    Then the "disposal-only" session should contain saved move details

  Scenario: Submit disposal only order and verify Google Sheet row
    When I complete the disposal only quote flow
    Then the "disposal-only" session should be cleared after submit
    And the latest Google Sheet row for the order should match the submitted disposal details
