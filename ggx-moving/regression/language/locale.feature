@regression @language
Feature: Language switching

  Background:
    Given a fresh GGX Moving test run
    And I open the GGX Moving homepage

  Scenario: Switch between English and Traditional Chinese
    When I switch GGX Moving language to "zh-HK"
    Then the homepage should be displayed in "zh-HK"
    When I switch GGX Moving language to "en-HK"
    Then the homepage should be displayed in "en-HK"
