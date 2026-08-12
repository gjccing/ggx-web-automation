@BET-4135 @disposal-only @hk @tracking
Feature: BET-4135 disposal_only_submitted Mixpanel parameters

  Submitting a Disposal only quote should fire Mixpanel event
  "disposal_only_submitted" with the BET-4097 properties (collection_location,
  preferred_time, remarks_length, total_photos_uploaded, total_items_counted,
  builder_time_secs).

  Scenario: Disposal submit fires disposal_only_submitted with required properties
    Given a fresh GGX Moving test run
    And Mixpanel tracking is captured
    And I open the GGX Moving homepage
    And I select the "disposal" service on the homepage
    And I click the homepage call to action
    When I complete the disposal only quote flow
    Then the Mixpanel event "disposal_only_submitted" should include required disposal submit properties
    And the disposal_only_submitted photo and remarks counts should match the empty extras submission
