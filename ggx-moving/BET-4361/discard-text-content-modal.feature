@BET-4361 @std-moving @disposal-only @hk
Feature: BET-4361 Discard text content modal when leaving manual item list

  On Items to move, after switching to the free-text list and typing content,
  choosing "Select from list" must show a "Discard text content?" confirmation.
  Cancelling keeps the typed text; confirming returns to the item picker.
  Covers Standard moving and Disposal only (same items-to-move UI).

  Background:
    Given a fresh GGX Moving test run

  Scenario Outline: <service> shows discard modal; cancel keeps text, confirm returns to list
    Given I am on the "<service>" items-to-move step at mobile width with embedded "false"
    When I switch to the manual item list and type "Television x 1"
    And I choose Select from list
    Then the Discard text content dialog should be shown
    When I cancel the Discard text content dialog
    Then I should still be on the manual item list with text "Television x 1"
    When I choose Select from list
    And I confirm discarding text content
    Then I should be back on the item picker list

    Examples:
      | service  |
      | standard |
      | disposal |
