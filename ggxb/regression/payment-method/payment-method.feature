@regression @payment-method
Feature: Payment method

  @hk
  Scenario: HK user can add a Stripe test credit card
    Given I am logged in to GGXB "hk" in English
    When I add a Stripe test credit card via the top-up modal
    Then the saved card "Automation E2E" should be visible in the top-up modal
    And I close the top-up wallet modal

  @hk
  Scenario: HK user can top up prepaid wallet
    Given I am logged in to GGXB "hk" in English
    When I top up the wallet using the $100 tier via the top-up modal
    Then the sidebar wallet balance should have increased by the top-up amount
    And I close the top-up wallet modal

  @hk
  Scenario: HK user can delete a saved credit card
    Given I am logged in to GGXB "hk" in English
    When I delete the Stripe test credit card from the top-up modal
    Then the saved card "Automation E2E" should not be visible in the top-up modal
    And I close the top-up wallet modal

  @sg
  Scenario: SG user can add a Stripe test credit card
    Given I am logged in to GGXB "sg"
    When I add a Stripe test credit card via the top-up modal
    Then the saved card "Automation E2E" should be visible in the top-up modal
    And I close the top-up wallet modal

  @sg
  Scenario: SG user can top up prepaid wallet
    Given I am logged in to GGXB "sg"
    When I top up the wallet using the $100 tier via the top-up modal
    Then the sidebar wallet balance should have increased by the top-up amount
    And I close the top-up wallet modal

  @sg
  Scenario: SG user can delete a saved credit card
    Given I am logged in to GGXB "sg"
    When I delete the Stripe test credit card from the top-up modal
    Then the saved card "Automation E2E" should not be visible in the top-up modal
    And I close the top-up wallet modal
