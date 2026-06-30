@regression @transport-order @HK-TX-020
Feature: Cancel Transport order

  @hk
  Scenario: HK user can cancel a placed transport order
    Given I am logged in to GGXB "hk" in English
    When I place a minimal transport order for "hk"
    Then the transport order payment method should be visible
    When I cancel the current transport order
    Then the transport order status should be "Order cancelled"

  @sg
  Scenario: SG user can cancel a placed transport order
    Given I am logged in to GGXB "sg"
    When I place a minimal transport order for "sg"
    Then the transport order payment method should be visible
    When I cancel the current transport order
    Then the transport order status should be "Order cancelled"
