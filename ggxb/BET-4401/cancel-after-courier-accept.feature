@BET-4401 @delivery-order @hk
Feature: BET-4401 Cancel delivery order after courier acceptance shows instruction

  # After a courier accepts via dp-d2, Cancel Order should show the
  # "call customer service" instruction instead of calling the cancel API.

  Scenario: HK cancel after courier accept shows cancellation instruction
    Given I am logged in to GGXB "hk" in English
    When I place a minimal delivery order for "hk"
    And a courier accepts the current delivery order via DA API for "hk"
    And I reopen the current delivery order to confirm courier acceptance in "hk"
    Then the delivery order status should match "Accepted by a courier|Accepted by driver|Accepted"
    When I cancel the accepted delivery order
    Then the cancellation instruction dialog should ask to call GoGoX
    And the delivery order should still not be cancelled
