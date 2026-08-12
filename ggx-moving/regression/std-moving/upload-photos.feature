@BET-4190 @BET-4191 @regression @std-moving @upload-photos
Feature: Extra services photo upload

  Background:
    Given a fresh GGX Moving test run
    And I open the standard moving extra services step

  Scenario: Selecting a photo uploads it to the temporary folder immediately
    When I select a photo on the extra services step
    Then the photo should be uploaded to the temporary folder
    And the photo preview should be visible

  Scenario: Submitting an order with photos moves them into the order folder
    When I select a photo on the extra services step
    And I complete the quote from extra services with the uploaded photo
    Then the uploaded photo should be moved into the order Drive folder
    And the latest Google Sheet row should include the photos Drive folder link
