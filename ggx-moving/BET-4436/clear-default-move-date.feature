@BET-4436 @moving @hk
Feature: BET-4436 Clear the default move date across all services

  Enquiry forms must not pre-fill tomorrow as the preferred move date.
  Date is required; continuing without a date is blocked with an error.

  Background:
    Given a fresh GGX Moving test run
    And I open the GGX Moving homepage

  Scenario Outline: Date field is empty and required on <service>
    When I select the "<service>" service on the homepage
    And I click the homepage call to action
    Then the preferred move date field should be empty
    When I try to continue the enquiry without choosing a move date
    Then the select-a-date validation error should be shown
    And I should still be on the "<service>" enquiry form

    Examples:
      | service    |
      | standard   |
      | disposal   |
      | corporate  |
      | overseas   |
