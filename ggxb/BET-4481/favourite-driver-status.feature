@BET-4481 @hk @transport-order
Feature: BET-4481 Favourite driver status updates when the success toast is shown

  Scenario: Order detail favourite status updates when the success message is shown
    Given I am logged in to GGXB "hk" as the BET-4481 test user in English
    When I open a transport order that has an assigned driver
    And I favourite that assigned driver
    Then the driver favourite status is already updated when the favourited success message is shown
