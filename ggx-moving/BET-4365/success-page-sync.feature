@BET-4365 @hk @moving @success-page
Feature: BET-4365 Apply success page updates to Disposal, Corporate & Overseas

  Disposal, Corporate and Overseas success pages should match the BET-4333
  Standard moving success page (layout/copy + templated WhatsApp) in EN and ZH.
  Standard moving behaviour stays unchanged.

  Background:
    Given a fresh GGX Moving test run

  Scenario: Disposal success page matches Standard layout and WhatsApp template
    Given I open the GGX Moving homepage
    And I select the "disposal" service on the homepage
    And I click the homepage call to action
    When I complete the disposal only quote flow
    Then the success page should match the BET-4333 layout in "en-HK"
    And the WhatsApp contact should open to 64675050 with submission time and contact phone in "en-HK"
    When I switch GGX Moving language to "zh-HK"
    Then the success page should match the BET-4333 layout in "zh-HK"
    And the WhatsApp contact should open to 64675050 with submission time and contact phone in "zh-HK"

  Scenario: Corporate success page matches Standard layout and WhatsApp template
    Given I open the GGX Moving homepage
    And I select the "corporate" service on the homepage
    And I click the homepage call to action
    When I complete the corporate moving quote flow
    Then the success page should match the BET-4333 layout in "en-HK"
    And the WhatsApp contact should open to 64675050 with submission time and contact phone in "en-HK"
    When I switch GGX Moving language to "zh-HK"
    Then the success page should match the BET-4333 layout in "zh-HK"
    And the WhatsApp contact should open to 64675050 with submission time and contact phone in "zh-HK"

  Scenario: Overseas success page matches Standard layout and WhatsApp template
    Given I open the GGX Moving homepage
    And I select the "overseas" service on the homepage
    And I click the homepage call to action
    When I complete the overseas moving quote flow
    Then the success page should match the BET-4333 layout in "en-HK"
    And the WhatsApp contact should open to 64675050 with submission time and contact phone in "en-HK"
    When I switch GGX Moving language to "zh-HK"
    Then the success page should match the BET-4333 layout in "zh-HK"
    And the WhatsApp contact should open to 64675050 with submission time and contact phone in "zh-HK"

  Scenario: Standard success page behaviour remains unchanged
    Given I open the GGX Moving homepage
    And I select the "standard" service on the homepage
    And I click the homepage call to action
    When I complete the standard moving quote flow
    Then the success page should match the BET-4333 layout in "en-HK"
    And the WhatsApp contact should open to 64675050 with submission time and contact phone in "en-HK"
    When I switch GGX Moving language to "zh-HK"
    Then the success page should match the BET-4333 layout in "zh-HK"
    And the WhatsApp contact should open to 64675050 with submission time and contact phone in "zh-HK"
