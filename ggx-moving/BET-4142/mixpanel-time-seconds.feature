@BET-4142 @std-moving @hk @tracking
Feature: BET-4142 Mixpanel time parameters use seconds

  Time properties on Mixpanel events must be seconds (not milliseconds)
  so they stay consistent with other events.

  Background:
    Given a fresh GGX Moving test run
    And Mixpanel tracking is captured
    And I open the GGX Moving homepage
    And I select the "standard" service on the homepage
    And I click the homepage call to action

  Scenario: Confirming WaypointField fires address_popup_confirmed.popup_time_secs in seconds
    When I confirm the From waypoint address popup
    Then the Mixpanel event "address_popup_confirmed" should report "popup_time_secs" in seconds

  Scenario: Submitting a quote fires moving_form_submitted.time_to_submit as Unix seconds
    When I complete the standard moving quote flow
    Then the Mixpanel event "moving_form_submitted" should report "time_to_submit" as a Unix timestamp in seconds
