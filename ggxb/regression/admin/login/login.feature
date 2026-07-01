@regression @login @admin @ID_LoginAdminGGXB
Feature: GGXB Admin Panel Login

  @hk
  Scenario: HK admin user can log in successfully
    Given I am on the GGXB "hk" admin login page
    When I log in with valid "hk" admin credentials
    Then I should be on an authenticated admin panel page

  @sg
  Scenario: SG admin user can log in successfully
    Given I am on the GGXB "sg" admin login page
    When I log in with valid "sg" admin credentials
    Then I should be on an authenticated admin panel page
