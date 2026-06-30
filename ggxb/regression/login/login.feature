@regression @login @ID_LoginWebGGXB
Feature: GGXB Login

  @hk
  Scenario: HK master user can log in successfully
    Given I am on the GGXB "hk" login page in English
    When I log in with valid "hk" master user credentials
    Then I should be on an authenticated GGXB page

  @sg
  Scenario: SG master user can log in successfully
    Given I am on the GGXB "sg" login page
    When I log in with valid "sg" master user credentials
    Then I should be on an authenticated GGXB page
