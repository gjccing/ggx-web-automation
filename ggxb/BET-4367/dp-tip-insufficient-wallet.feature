@BET-4367 @delivery-order @hk @i18n
Feature: BET-4367 DP tip insufficient wallet balance error message

  # Account GGXB_HK_BET_4367_USER_* keeps ~$203 wallet with pending DP holds so
  # a $100 tip exceeds remaining prepaid balance.

  @en-HK
  Scenario: HK English shows clear insufficient-balance error when DP tip exceeds wallet
    Given I am logged in to GGXB "hk" as the BET-4367 test user in English
    When I open a pending delivery order for tip testing in "hk"
    And I add a maximum delivery tip in "en-HK"
    Then the insufficient balance with tip alert in "en-HK" should be shown

  @zh-HK
  Scenario: HK Traditional Chinese shows clear insufficient-balance error when DP tip exceeds wallet
    Given I am logged in to GGXB "hk" as the BET-4367 test user in Traditional Chinese
    When I open a pending delivery order for tip testing in "hk"
    And I add a maximum delivery tip in "zh-HK"
    Then the insufficient balance with tip alert in "zh-HK" should be shown
