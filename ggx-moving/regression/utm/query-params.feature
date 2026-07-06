@regression @utm
Feature: URL query parameters

  Background:
    Given a fresh GGX Moving test run

  Scenario: UTM query parameters are captured into session storage
    When I open the GGX Moving homepage with query "?utm_medium=e2e&utm_source=automation&utm_campaign=regression&utm_content=homepage"
    Then the captured UTM session should include:
      | field    | value      |
      | medium   | e2e        |
      | source   | automation |
      | campaign | regression |
      | content  | homepage   |
