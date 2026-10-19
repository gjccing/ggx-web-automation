@BET-4501 @login
Feature: BET-4501 SG login sign-up link uses an SG utm campaign

  @sg
  Scenario: SG login page Sign up link uses the SG default campaign
    Given I am on the GGXB "sg" login page
    Then the sign-up link utm_campaign should be "SG_B2B-login-page"
    And the sign-up link utm_source should be "website"
    And the sign-up link utm_medium should be "button"

  @hk
  Scenario: HK login page Sign up link keeps the HK default campaign
    Given I am on the GGXB "hk" login page in English
    Then the sign-up link utm_campaign should be "HK_B2B-login-page"
    And the sign-up link utm_source should be "website"
    And the sign-up link utm_medium should be "button"

  @sg
  Scenario: UTM parameters on the SG login URL are forwarded to the Sign up link
    Given I open the GGXB "sg" login page with utm parameters "utm_source=newsletter&utm_medium=email&utm_campaign=spring-promo"
    Then the sign-up link utm_campaign should be "spring-promo"
    And the sign-up link utm_source should be "newsletter"
    And the sign-up link utm_medium should be "email"

  @hk
  Scenario: UTM parameters on the HK login URL are forwarded to the Sign up link
    Given I open the GGXB "hk" login page with utm parameters "utm_source=newsletter&utm_medium=email&utm_campaign=spring-promo"
    Then the sign-up link utm_campaign should be "spring-promo"
    And the sign-up link utm_source should be "newsletter"
    And the sign-up link utm_medium should be "email"
