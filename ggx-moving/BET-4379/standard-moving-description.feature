@BET-4379 @homepage @hk @i18n
Feature: BET-4379 Update Standard moving service description copy

  Background:
    Given a fresh GGX Moving test run

  @en-HK
  Scenario: Standard moving body1 shows updated copy in English
    Given I open the GGX Moving homepage in "en-HK"
    When I select the "standard" service on the homepage
    Then the standard moving body1 description in "en-HK" should show the updated copy

  @zh-HK
  Scenario: Standard moving body1 shows updated copy in Traditional Chinese
    Given I open the GGX Moving homepage in "zh-HK"
    When I select the "standard" service on the homepage
    Then the standard moving body1 description in "zh-HK" should show the updated copy
