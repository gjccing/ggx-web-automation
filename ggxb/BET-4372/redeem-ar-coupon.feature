@BET-4372 @transport-order @coupon
Feature: BET-4372 Redeem AR coupon on transport order summary

  @hk
  Scenario: HK user redeeming a waste-AR coupon sees a success message on summary
    Given a fixed-discount voucher for BET-4372 exists in the GGXB "hk" admin panel
    And I am logged in to GGXB "hk" in English
    When I build a transport order with waste AR to summary for "hk"
    And I open the transport order coupon modal
    And I redeem the BET-4372 voucher code in the coupon modal
    Then the coupon redemption message should indicate success
    And I apply the selected coupon in the transport order coupon modal
    And the transport order summary should show the BET-4372 coupon applied

  @hk
  Scenario: HK user redeeming a waste-AR coupon on a non-matching order sees a not-applicable message
    Given a fixed-discount voucher for BET-4372 exists in the GGXB "hk" admin panel
    And I am logged in to GGXB "hk" in English
    When I build a transport order without waste AR to summary for "hk"
    And I open the transport order coupon modal
    And I redeem the BET-4372 voucher code in the coupon modal
    Then the coupon redemption message should indicate the order is not eligible

