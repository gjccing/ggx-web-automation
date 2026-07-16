@smoke @regression @visual
Feature: Visual smoke — key GGXB screens screenshot comparison

  Capture full-page screenshots of public auth surfaces and the main
  authenticated service pages so layout / UI drift is caught without placing
  real orders. Each authenticated page uses a fresh login so a mid-run
  session bounce cannot poison baselines.

  Background:
    Given a fresh GGXB visual smoke run

  @hk
  Scenario: HK public auth screens
    Given I open the GGXB "hk" path "/login" in English
    Then the UI snapshot "hk-login" should match
    When I open the GGXB "hk" path "/signup" in English
    Then the UI snapshot "hk-signup" should match
    When I open the GGXB "hk" path "/recovery" in English
    Then the UI snapshot "hk-recovery" should match

  @hk
  Scenario Outline: HK authenticated page <snapshot>
    Given I am logged in to GGXB "hk" in English
    When I open the GGXB "hk" path "<path>"
    Then the UI snapshot "<snapshot>" should match

    Examples:
      | path                          | snapshot                       |
      | /home                         | hk-home                        |
      | /van/order                    | hk-van-order                   |
      | /orders                       | hk-orders                      |
      | /van/favorite-drivers         | hk-favorite-drivers            |
      | /delivery/order               | hk-delivery-order              |
      | /delivery/order-management    | hk-delivery-order-management   |
      | /delivery/bulk-import         | hk-delivery-bulk-import        |
      | /payment-method               | hk-payment-method              |
      | /voucher                      | hk-voucher                     |
      | /billing-history              | hk-billing-history             |
      | /profile                      | hk-profile                     |
      | /users-and-branches           | hk-users-and-branches          |
      | /address-book                 | hk-address-book                |
      | /developer/dashboard          | hk-developer-dashboard         |

  @hk
  Scenario: HK transport place-order wizard steps without placing
    Given I am logged in to GGXB "hk" in English
    When I open the GGXB "hk" path "/van/order"
    And I fill the transport place-order route details for "hk"
    Then the UI snapshot "hk-van-order-route-details" should match
    When I proceed to the transport place-order order details step
    Then the UI snapshot "hk-van-order-order-details" should match
    When I proceed to the transport place-order summary without placing
    Then the UI snapshot "hk-van-order-summary" should match

  @hk
  Scenario: HK completed transport order detail
    Given I am logged in to GGXB "hk" in English
    When I open the GGXB "hk" path "/orders"
    And I open the first completed transport order detail
    Then the UI snapshot "hk-transport-order-detail" should match

  @hk
  Scenario: HK completed delivery order detail
    Given I am logged in to GGXB "hk" in English
    When I open the GGXB "hk" path "/delivery/order-management"
    And I open the first completed delivery order detail
    Then the UI snapshot "hk-delivery-order-detail" should match

  @sg
  Scenario: SG public login screen
    Given I open the GGXB "sg" path "/login"
    Then the UI snapshot "sg-login" should match

  @sg
  Scenario: SG authenticated van order screen
    Given I am logged in to GGXB "sg"
    # SG post-login landing is already `/van/order` — avoid a second navigation.
    Then the UI snapshot "sg-van-order" should match

  @sg
  Scenario: SG authenticated orders screen
    Given I am logged in to GGXB "sg"
    When I open the GGXB "sg" path "/orders"
    Then the UI snapshot "sg-orders" should match
