@BET-4416 @std-moving @hk
Feature: BET-4416 Photo upload at the stated 4.5MB maximum

  Extra services (step 3/4) states a 4.5MB photo limit. A file above that
  limit must be rejected in the UI. A photo at 4.5 decimal MB must upload
  instead of returning 413 and leaving the loading spinner stuck.

  Background:
    Given a fresh GGX Moving test run
    And I open the standard moving extra services step

  Scenario: A photo larger than 4.5MB is blocked with an error dialog
    When I select an over-limit photo on the extra services step
    Then the max file size dialog should be shown
    And the extra services upload should not stay loading
    And no photo preview should be visible

  Scenario: A 4.5MB photo uploads instead of failing with 413
    When I select a 4.5MB photo on the extra services step
    Then the photo should be uploaded to the temporary folder
    And the photo preview should be visible
    And the extra services upload should not stay loading
