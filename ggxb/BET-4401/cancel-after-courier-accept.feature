@BET-4401 @delivery-order @hk
Feature: BET-4401 Cancel delivery order after courier acceptance shows instruction

  # Keep the DP order-detail drawer open (no reload/reopen). After each DA API
  # action, assert status updates live via websocket (BET-4374 root cause).
  # On accepted status, Cancel Order must show the call-CS instruction alert.

  Scenario: HK cancel after courier accept shows cancellation instruction
    Given I am logged in to GGXB "hk"
    When I free courier delivery capacity for "hk"
    And I place a minimal delivery order for "hk"
    Then the delivery order status should match "Order placed|已落柯打"
    When a courier accepts the current delivery order via DA API for "hk"
    Then the delivery order status should match "Accepted by a courier|Accepted by driver|Accepted|接單"
    When I cancel the accepted delivery order
    Then the cancellation instruction dialog should ask to call GoGoX
    And the delivery order should still not be cancelled
    When a courier picks up the current delivery order via DA API for "hk"
    Then the delivery order status should match "Package picked up|已取件|Picked up|接載"
    When a courier completes the current delivery order via DA API for "hk"
    Then the delivery order status should match "Package delivered|Completed|已完成|已送達|完成"
