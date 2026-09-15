@BET-4452 @hk @transport-order @payment-method
Feature: BET-4452 Closing the payment method picker via X does not apply the selection

  Closing the Pay with picker with the top-right X is a cancel. Only Confirm / OK
  should apply a newly selected payment method on the transport Summary step.

  Scenario: Closing the picker with X keeps the original Wallet payment method
    Given I am logged in to GGXB "hk" in English
    And a saved credit card is available for the transport payment picker
    When I build a transport order to summary for "hk"
    Then the transport summary payment method should be Wallet
    When I open the transport summary payment method picker
    And I select the saved credit card in the payment method picker
    And I close the payment method picker with the X button
    Then the transport summary payment method should be Wallet

  Scenario: Confirming the picker applies the selected credit card
    Given I am logged in to GGXB "hk" in English
    And a saved credit card is available for the transport payment picker
    When I build a transport order to summary for "hk"
    Then the transport summary payment method should be Wallet
    When I open the transport summary payment method picker
    And I select the saved credit card in the payment method picker
    And I confirm the payment method picker
    Then the transport summary payment method should be the saved credit card
