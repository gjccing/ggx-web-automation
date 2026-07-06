@BET-4377 @transport-order @hk @i18n
Feature: BET-4377 Update fixed-fee moving translation keys

  @en-HK
  Scenario Outline: Pallet helper copy appears only for truck fixed-fee moving (en-HK)
    Given I am logged in to GGXB "hk" in English
    When I open transport order details in "en-HK" with "<vehicle>" and move goods door-to-door
    And I select the fixed fee moving option in "en-HK"
    Then the fixed fee pallet helper text in "en-HK" should be visible: <pallet_body_visible>

    Examples:
      | vehicle        | pallet_body_visible |
      | Van            | false               |
      | 5.5 ton truck  | true                |
      | 9 ton truck    | true                |

  @zh-HK
  Scenario Outline: Pallet helper copy appears only for truck fixed-fee moving (zh-HK)
    Given I am logged in to GGXB "hk" in Traditional Chinese
    When I open transport order details in "zh-HK" with "<vehicle>" and move goods door-to-door
    And I select the fixed fee moving option in "zh-HK"
    Then the fixed fee pallet helper text in "zh-HK" should be visible: <pallet_body_visible>

    Examples:
      | vehicle     | pallet_body_visible |
      | Van仔       | false               |
      | 5.5 噸貨車  | true                |
      | 9 噸貨車    | true                |

  @en-HK
  Scenario Outline: Fixed fee info tooltip uses vehicle-specific copy (en-HK)
    Given I am logged in to GGXB "hk" in English
    When I open transport order details in "en-HK" with "<vehicle>" and move goods door-to-door
    And I hover the fixed fee info icon in "en-HK"
    Then the fixed fee info tooltip in "en-HK" for "<vehicle>" should show the updated copy

    Examples:
      | vehicle        |
      | Van            |
      | 5.5 ton truck  |
      | 9 ton truck    |

  @zh-HK
  Scenario Outline: Fixed fee info tooltip uses vehicle-specific copy (zh-HK)
    Given I am logged in to GGXB "hk" in Traditional Chinese
    When I open transport order details in "zh-HK" with "<vehicle>" and move goods door-to-door
    And I hover the fixed fee info icon in "zh-HK"
    Then the fixed fee info tooltip in "zh-HK" for "<vehicle>" should show the updated copy

    Examples:
      | vehicle     |
      | Van仔       |
      | 5.5 噸貨車  |
      | 9 噸貨車    |
