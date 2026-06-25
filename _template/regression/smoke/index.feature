@smoke @regression
Feature: Page smoke test

  Scenario: Open page via browser URL and verify it works
    Given I open the product homepage
    Then the page should load successfully
