@BET-4550 @hk
Feature: BET-4550 HK transport bulk import page gate

  # Local b2b-website on feat/BET_4516 with ENABLE_DEBUG=true.
  # A reload or route enter reads transport_bulk_import from Split again, so a
  # debug-menu change only applies on the screen where it was made.
  Scenario: TT shows the transport bulk import nav and FF removes it
    Given I am logged in to GGXB "hk" in English
    When I set the transport bulk import feature flag to on
    Then the transport bulk import nav item is visible
    When I set the transport bulk import feature flag to off
    Then the transport bulk import nav item disappears
