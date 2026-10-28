@BET-4486 @hk @transport-order
Feature: BET-4486 Cancel confirmation stays open during transport drawer refresh

  A pending transport order detail drawer refreshes itself in the background.
  That refresh updates the open drawer in place. The loading spinner is shown
  only on the first load, and an open "Cancel order?" confirmation stays open
  until the user picks one of its buttons.

  Scenario: Cancel confirmation stays open across the drawer background refresh
    Given I am logged in to GGXB "hk" in English
    When I place a minimal transport order for "hk"
    And I reopen that pending transport order from order management
    And I open the cancel order confirmation
    And I wait until 2 minutes have passed since the transport order drawer was opened
    Then the cancel order confirmation should still be open
    And the transport order drawer should still show its loaded content
