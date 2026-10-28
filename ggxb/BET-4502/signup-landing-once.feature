@BET-4502 @signup
Feature: BET-4502 Sign up landing Mixpanel event fires once

  @hk
  Scenario: HK signup page sends one sign up landing event
    When I open the GGXB "hk" signup page with UTM parameters for BET-4502
    Then exactly one sign up landing Mixpanel event is recorded
    And the sign up landing event includes previous_page and the BET-4502 UTM super properties

  @sg
  Scenario: SG signup page sends one sign up landing event
    When I open the GGXB "sg" signup page with UTM parameters for BET-4502
    Then exactly one sign up landing Mixpanel event is recorded
    And the sign up landing event includes previous_page and the BET-4502 UTM super properties
