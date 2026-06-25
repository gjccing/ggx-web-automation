@smoke @regression
Feature: Page smoke test

  @hk
  Scenario: HK staging homepage loads
    Given I open the GGXB "hk" homepage
    Then the page should load successfully

  @sg
  Scenario: SG staging homepage loads
    Given I open the GGXB "sg" homepage
    Then the page should load successfully
