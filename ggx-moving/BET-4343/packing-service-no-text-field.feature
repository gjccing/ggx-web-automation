@BET-4343 @std-moving @hk
Feature: BET-4343 Remove text field for Packing into cartons

  The free-text description field appended to the "Packing into cartons"
  (紙箱打包) extra-service option is removed. The option itself remains.

  Background:
    Given a fresh GGX Moving test run

  Scenario: Selecting packing service does not show a description field
    Given I am on the standard moving extra services step
    When I select the packing into cartons option
    Then the packing into cartons option should remain available
    And no free-text field should appear for the packing service
