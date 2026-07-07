@BET-4376 @transport-order @hk @i18n
Feature: BET-4376 Airport carpark pop-up wording (PISD-1356)

  @zh-HK
  Scenario: HK airport extra-fee dialog uses updated zh-HK vehicle category copy
    Given I am logged in to GGXB "hk" in Traditional Chinese
    When I select Hong Kong International Airport on the transport order page in "zh-HK"
    Then the airport extra fee dialog in "zh-HK" should be visible
    And the airport extra fee dialog in "zh-HK" should show the updated fee wording

  @en-HK
  Scenario: HK airport extra-fee dialog keeps unchanged en-HK copy
    Given I am logged in to GGXB "hk" in English
    When I select Hong Kong International Airport on the transport order page in "en-HK"
    Then the airport extra fee dialog in "en-HK" should be visible
    And the airport extra fee dialog in "en-HK" should show the expected fee wording
