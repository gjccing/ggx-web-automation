@BET-4179 @hk @billing
Feature: BET-4179 Display Stripe chargebacks in Transaction History

  Scenario: Transaction type filter includes Additional charge
    Given I am logged in to GGXB "hk" in English
    When I open the GGXB transaction history page
    Then the transaction type filter should include "Additional charge"

  Scenario: Additional charge records display with the chargeback date
    Given I am logged in to GGXB "hk" in English
    When I open the GGXB transaction history page
    And I set the transaction history date range from "17/08/26" to "17/08/26"
    And I filter transaction history by type "Additional charge"
    Then the transaction history should show order "#RW3877100" as "Additional charge" dated "17 Aug"
