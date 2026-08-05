@BET-4403 @transport-order @coupon @hk
Feature: BET-4403 Coupon applied toast via top Coupon entry on summary

  Scenario: Applying a coupon via the top Coupon entry shows a success toast
    Given a fixed-discount voucher for BET-4403 exists in the GGXB "hk" admin panel
    And I am logged in to GGXB "hk" in English
    When I build a transport order to summary for "hk"
    And I open the transport order coupon modal via the top Coupon entry
    And I redeem the BET-4403 voucher code in the coupon modal
    And I apply the selected coupon in the transport order coupon modal
    Then the coupon applied success toast should be shown
    And the transport order summary should show the BET-4403 coupon applied
