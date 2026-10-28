@BET-4481 @hk @transport-order
Feature: BET-4481 Favourite driver status updates when the success toast is shown

  # Place a transport order, then the transport driver claims it
  # (pending → picked) and confirms it (picked → active) so the order has an
  # assigned driver before the favourite assertion.

  Scenario: Order detail favourite status updates when the success message is shown
    Given I am logged in to GGXB "hk" as the BET-4481 test user in English
    When I place a minimal transport order for "hk"
    And a transport driver accepts the current transport order to active for "hk"
    And I open that transport order
    And I favourite that assigned driver
    Then the driver favourite status is already updated when the favourited success message is shown
