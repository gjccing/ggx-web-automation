@BET-4451 @transport-order @coupon @hk
Feature: BET-4451 New transport order without a voucher does not show coupon-applied toast

  Scenario: Summary of a new order with no coupon does not show feedback__coupon_applied
    Given a fixed-discount voucher for BET-4451 exists in the GGXB "hk" admin panel
    And I am logged in to GGXB "hk" in English
    When I build a transport order to summary for "hk"
    And I open the transport order coupon modal
    And I redeem the BET-4451 voucher code in the coupon modal
    And I apply the selected coupon in the transport order coupon modal
    And I place the current transport order
    And I start a new transport order to summary for "hk" without a coupon
    Then the coupon-applied feedback toast should not have appeared
    And the transport order summary should not show a coupon applied
