@BET-4504 @delivery-order @hk
Feature: BET-4504 Delivery order status time shows HKT outside Hong Kong

  Scenario: Status column includes HKT when the browser time zone is Asia/Tokyo
    Given the browser time zone is "Asia/Tokyo"
    And I am logged in to GGXB "hk" as the BET-4504 test user in English
    When I open the delivery order management page in "hk"
    And I set the delivery order date range from "01/10/26" to "31/10/26"
    And I search delivery orders for "izoLSg"
    Then delivery order "#izoLSg" status time should include "HKT" like the shipper time
