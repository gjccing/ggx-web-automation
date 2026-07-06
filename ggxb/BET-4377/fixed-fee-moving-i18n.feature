@BET-4377 @transport-order @hk @i18n
Feature: BET-4377 Update fixed-fee moving translation keys

  Scenario Outline: Pallet helper copy appears only for truck fixed-fee moving
    Given I am logged in to GGXB "hk" in English
    When I open transport order details with "<vehicle>" and move goods door-to-door
    And I select the fixed fee moving option
    Then the fixed fee pallet helper text should be visible: <pallet_body_visible>

    Examples:
      | vehicle        | pallet_body_visible |
      | Van            | false               |
      | 5.5 ton truck  | true                |
      | 9 ton truck    | true                |

  Scenario Outline: Fixed fee info tooltip uses vehicle-specific copy
    Given I am logged in to GGXB "hk" in English
    When I open transport order details with "<vehicle>" and move goods door-to-door
    And I hover the fixed fee info icon
    Then the fixed fee info tooltip for "<vehicle>" should show the updated copy

    Examples:
      | vehicle        |
      | Van            |
      | 5.5 ton truck  |
      | 9 ton truck    |
