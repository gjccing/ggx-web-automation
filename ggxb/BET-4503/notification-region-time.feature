@BET-4503 @hk @notifications
Feature: BET-4503 Notification timestamps use the region time zone

  # Browser zone is Tokyo (UTC+9). HK orders use HKT (UTC+8).
  # The "Order has been created" pop-up and the notifications panel share one timestamp.
  # Account: GGXB_HK_BET_4503_USER_* in .env.

  Scenario: HK notification time matches the order page when the browser is in Tokyo
    Given I am logged in to GGXB "hk" in English as the BET-4503 user with browser time zone "Asia/Tokyo"
    When I open the notifications panel
    Then the "Order has been created" notification time should match the order placed time with an "HKT" suffix
