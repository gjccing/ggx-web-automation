@BET-4450 @hk @payment-method
Feature: BET-4450 Add card Confirm does not stay loading after a failed attempt

  Scenario: After an invalid card error, adding another card can complete
    Given I am logged in to GGXB "hk" in English
    When I open the add card dialog on the payment method page
    And I submit the invalid BET-4450 card in the add card dialog
    Then the add card dialog should show that the card number is incorrect
    When I correct the card number to a Stripe test card and submit again
    Then the saved card "BET-4450 E2E" should be visible on the payment method page
    And I remove the saved card "BET-4450 E2E" from the payment method page
