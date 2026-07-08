@BET-4358 @std-moving @hk @mobile @layout
Feature: BET-4358 Items-to-move section tab indicator tracks the visible section

  On the Items to Move step the category tabs (Common / Appliances / Furniture /
  Others) act as a scroll spy: the active tab must reflect the section currently
  at the top of the list. The indicator must update as each new section enters the
  viewport when scrolling down AND when scrolling back up — the scroll-up
  behaviour must mirror the scroll-down behaviour. Verified at a ~375px mobile
  viewport for Standard moving.

  Background:
    Given a fresh GGX Moving test run

  @web
  Scenario: Active tab follows each section while scrolling down
    Given I am on the "standard" items-to-move step at mobile width with embedded "false"
    Then the active category tab should follow each section while scrolling down

  @web
  Scenario: Active tab follows each section while scrolling up
    Given I am on the "standard" items-to-move step at mobile width with embedded "false"
    Then the active category tab should follow each section while scrolling up
