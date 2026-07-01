@regression @delivery-order
Feature: Cancel Delivery order

  @hk
  Scenario: HK user can cancel a placed delivery order
    Given I am logged in to GGXB "hk" in English
    When I place a minimal delivery order for "hk"
    Then the delivery order payment method should be visible
    When I cancel the current delivery order
    Then the delivery order status should be "Order cancelled"
