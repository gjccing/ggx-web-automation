@regression @transport-order @HK-TX-018
Feature: Create Transport order

  @hk
  Scenario: HK master user can create a transport order
    Given I am logged in to GGXB "hk" in English
    When I place a minimal transport order for "hk"
    Then the transport order detail should show the placed route for "hk"
    And the transport order id should match the expected format
    And the transport order vehicle type should be present
    When I cancel the current transport order
    Then the transport order status should be "Order cancelled"

  @sg
  Scenario: SG master user can create a transport order
    Given I am logged in to GGXB "sg"
    When I place a minimal transport order for "sg"
    Then the transport order detail should show the placed route for "sg"
    And the transport order id should match the expected format
    And the transport order vehicle type should be present
    When I cancel the current transport order
    Then the transport order status should be "Order cancelled"
