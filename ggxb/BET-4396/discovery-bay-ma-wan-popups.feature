@BET-4396 @transport-order @hk @i18n
Feature: BET-4396 Region pop-ups for Discovery Bay and Ma Wan

  @zh-HK
  Scenario: HK Discovery Bay address shows region pop-up in zh-HK
    Given I am logged in to GGXB "hk" in Traditional Chinese
    When I select "Discovery Bay" on the transport order page in "zh-HK"
    Then the "Discovery Bay" region warning dialog in "zh-HK" should be visible
    And the "Discovery Bay" region warning dialog in "zh-HK" should show the expected wording

  @en-HK
  Scenario: HK Discovery Bay address shows region pop-up in en-HK
    Given I am logged in to GGXB "hk" in English
    When I select "Discovery Bay" on the transport order page in "en-HK"
    Then the "Discovery Bay" region warning dialog in "en-HK" should be visible
    And the "Discovery Bay" region warning dialog in "en-HK" should show the expected wording

  @zh-HK
  Scenario: HK Ma Wan address shows region pop-up in zh-HK
    Given I am logged in to GGXB "hk" in Traditional Chinese
    When I select "Ma Wan" on the transport order page in "zh-HK"
    Then the "Ma Wan" region warning dialog in "zh-HK" should be visible
    And the "Ma Wan" region warning dialog in "zh-HK" should show the expected wording

  @en-HK
  Scenario: HK Ma Wan address shows region pop-up in en-HK
    Given I am logged in to GGXB "hk" in English
    When I select "Ma Wan" on the transport order page in "en-HK"
    Then the "Ma Wan" region warning dialog in "en-HK" should be visible
    And the "Ma Wan" region warning dialog in "en-HK" should show the expected wording
