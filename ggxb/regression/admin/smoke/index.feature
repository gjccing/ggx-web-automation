@smoke @regression @admin
Feature: Admin panel smoke test

  @hk
  Scenario: HK admin panel login page loads
    Given I open the GGXB "hk" admin panel
    Then the admin login page should load successfully

  @sg
  Scenario: SG admin panel login page loads
    Given I open the GGXB "sg" admin panel
    Then the admin login page should load successfully
