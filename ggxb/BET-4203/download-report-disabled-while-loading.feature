@BET-4203 @order-management @hk
Feature: BET-4203 Download report disabled while OM table is loading

  Scenario: Transport OM download menu stays closed during table loading
    Given I am logged in to GGXB "hk" in English
    When I open the transport order management page
    And I delay subsequent transport order list requests
    And I change the transport order status filter to "Completed"
    Then the download report menu should not open while the order table is loading

  Scenario: Delivery OM download menu stays closed during table loading
    Given I am logged in to GGXB "hk" in English
    When I open the delivery order management page
    And I delay subsequent delivery order list requests
    And I change the delivery order status filter to "Completed"
    Then the download report menu should not open while the order table is loading
