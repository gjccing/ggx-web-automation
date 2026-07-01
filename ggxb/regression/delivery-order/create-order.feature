@regression @delivery-order
Feature: Create Delivery order

  @hk
  Scenario: HK master user can create a delivery order
    Given I am logged in to GGXB "hk" in English
    When I place a minimal delivery order for "hk"
    Then the delivery order detail should show the placed route for "hk"
    And the delivery order id should match the expected format
    And the delivery order pick-up code should be present
    When I cancel the current delivery order
    Then the delivery order status should be "Order cancelled"
