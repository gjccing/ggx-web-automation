@smoke @regression @visual
Feature: Visual smoke — key screens screenshot comparison

  Capture full-page screenshots of every major service entry, overlay, and
  expanded form state so layout / UI drift is caught. Submit is only used for
  the submitted-page snapshot.

  Background:
    Given a fresh GGX Moving test run

  Scenario: Homepage default layout
    Given I open the GGX Moving homepage
    Then the UI snapshot "homepage" should match

  Scenario: Homepage Traditional Chinese layout
    Given I open the GGX Moving homepage
    When I switch GGX Moving language to "zh-HK"
    Then the UI snapshot "homepage-zh-HK" should match

  Scenario Outline: Homepage with a service card selected
    Given I open the GGX Moving homepage
    When I select the "<service>" service on the homepage
    Then the UI snapshot "homepage-<service>" should match

    Examples:
      | service    |
      | standard   |
      | corporate  |
      | van-rental |
      | disposal   |
      | overseas   |

  Scenario: Van rental download-app dialog
    Given I open the GGX Moving homepage
    When I select the "van-rental" service on the homepage
    And I click the homepage call to action
    Then the van rental download app dialog should be visible
    And the UI snapshot "van-rental-dialog" should match

  Scenario: Standard moving wizard screens
    Given I open the GGX Moving homepage
    When I select the "standard" service on the homepage
    And I click the homepage call to action
    Then I should be on the "std-moving" "move-details" page
    And the UI snapshot "std-moving-move-details" should match
    When I open the From waypoint field
    Then the WaypointField dialog should be visible
    And the UI snapshot "std-moving-waypoint-field" should match
    When I dismiss the WaypointField dialog
    And I fill the standard moving move details without continuing
    And I continue to the next wizard step
    Then I should be on the "std-moving" "items-to-move" page
    And the UI snapshot "std-moving-items-to-move" should match
    When I open the items-to-move fullscreen manual list
    Then the UI snapshot "std-moving-items-to-move-fullscreen" should match
    When I leave the items-to-move fullscreen manual list
    And I continue to the next wizard step
    Then I should be on the "std-moving" "extra-services" page
    And the UI snapshot "std-moving-extra-services" should match
    When I expand extra services that reveal detail fields
    Then the UI snapshot "std-moving-extra-services-expanded" should match
    When I continue to the next wizard step
    Then I should be on the "std-moving" "final-details" page
    And the UI snapshot "std-moving-final-details" should match

  Scenario: Standard moving submitted page
    Given I open the GGX Moving homepage
    When I select the "standard" service on the homepage
    And I click the homepage call to action
    And I complete the standard moving quote flow
    Then I should be on the "std-moving" "submitted" page
    And the UI snapshot "std-moving-submitted" should match

  Scenario: Disposal only wizard entry
    Given I open the GGX Moving homepage
    When I select the "disposal" service on the homepage
    And I click the homepage call to action
    Then I should be on the "disposal-only" "disposal-details" page
    And the UI snapshot "disposal-only-disposal-details" should match
    When I fill the disposal move details without continuing
    And I continue to the next wizard step
    Then I should be on the "disposal-only" "items-to-move" page
    And the UI snapshot "disposal-only-items-to-move" should match

  Scenario: Corporate moving form
    Given I open the GGX Moving homepage
    When I select the "corporate" service on the homepage
    And I click the homepage call to action
    Then I should be on the "corporate-moving-services" page
    And the UI snapshot "corporate-moving" should match

  Scenario: Overseas moving form with HK and Canada details
    Given I open the GGX Moving homepage
    When I select the "overseas" service on the homepage
    And I click the homepage call to action
    Then I should be on the "overseas-moving" page
    And the UI snapshot "overseas-moving" should match
    When I select overseas from country "Hong Kong"
    Then the UI snapshot "overseas-moving-from-hong-kong" should match
    When I select overseas to country "Canada"
    Then the UI snapshot "overseas-moving-hk-canada" should match
