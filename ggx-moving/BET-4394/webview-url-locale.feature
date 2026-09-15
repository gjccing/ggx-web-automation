@BET-4394 @moving @hk @i18n @language
Feature: BET-4394 Moving webview shows the previous language after switching the in-app language

  localStorage remembers the last locale. Opening a different language URL
  (as the CA app does when the in-app language changes) must override the page language.

  Background:
    Given a fresh GGX Moving test run

  Scenario Outline: A different language URL overrides the stored locale
    Given I previously opened GGX Moving in "<stored>"
    When I enter GGX Moving via the "<url>" language URL
    Then the homepage should be displayed in "<url>"
    And the GGX Moving page URL should use locale "<url>"

    Examples:
      | stored | url   |
      | en-HK  | zh-HK |
      | zh-HK  | en-HK |
