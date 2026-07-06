@regression @homepage
Feature: Homepage services

  Background:
    Given a fresh GGX Moving test run
    And I open the GGX Moving homepage

  Scenario: Standard moving opens the move details wizard
    When I select the "standard" service on the homepage
    And I click the homepage call to action
    Then I should be on the "std-moving" "move-details" page

  Scenario: Special moving services opens corporate moving form
    When I select the "corporate" service on the homepage
    And I click the homepage call to action
    Then I should be on the "corporate-moving-services" page

  Scenario: Van truck rental shows download app dialog on web
    When I select the "van-rental" service on the homepage
    And I click the homepage call to action
    Then the van rental download app dialog should appear

  Scenario: Disposal only opens disposal details wizard
    When I select the "disposal" service on the homepage
    And I click the homepage call to action
    Then I should be on the "disposal-only" "disposal-details" page

  Scenario: Overseas moving opens overseas moving form
    When I select the "overseas" service on the homepage
    And I click the homepage call to action
    Then I should be on the "overseas-moving" page
