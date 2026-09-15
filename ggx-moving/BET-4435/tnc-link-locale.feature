@BET-4435 @homepage @hk @i18n
Feature: BET-4435 Relabel the T&C links and match them to page language

  The first two homepage services must name the T&C, and each language
  version must open the T&C in that language.

  Background:
    Given a fresh GGX Moving test run

  Scenario Outline: <service> T&C link in <locale>
    Given I open the GGX Moving homepage in "<locale>"
    When I select the "<service>" service on the homepage
    Then the selected "<service>" T&C link should use the "<locale>" label
    And the selected "<service>" T&C link should open the "<locale>" terms page

    Examples:
      | service   | locale |
      | standard  | en-HK  |
      | corporate | en-HK  |
      | standard  | zh-HK  |
      | corporate | zh-HK  |
