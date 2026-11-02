@BET-4550 @hk
Feature: BET-4550 HK transport bulk import page gate

  # Local b2b-website on feat/BET_4516 with ENABLE_DEBUG=true.
  # Point GGXB_HK_BASE_URL at that server. Staging does not have this gate yet.
  Scenario: HK business user sees transport bulk import when the flag is on
    Given I am logged in to GGXB "hk" in English
    When I set the transport bulk import feature flag to off
    Then the transport bulk import entry follows the flag being off for this HK organization
    When I set the transport bulk import feature flag to on
    Then the transport bulk import nav item is visible
    And the transport bulk import page stays open
