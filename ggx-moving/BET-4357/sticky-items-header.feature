@BET-4357 @std-moving @disposal-only @hk @mobile @layout
Feature: BET-4357 Items-to-move header stays pinned while scrolling

  On the Items to Move step the category tabs (Common / Appliances / Furniture /
  Others) and other header elements must stay pinned at the top while the item
  list scrolls, so the user can switch tabs at any scroll position. Verified at a
  ~375px mobile viewport for both Standard moving and Disposal only.

  The `?embedded=true` query (in-app WebView) hides the site header, which shifts
  the whole layout, so each flow is checked with embedded on and off.

  Background:
    Given a fresh GGX Moving test run

  @web
  Scenario Outline: <service> category tabs stay pinned when scrolling (standalone web)
    Given I am on the "<service>" items-to-move step at mobile width with embedded "false"
    When I scroll the items-to-move list to the bottom
    Then the items-to-move list should have scrolled
    And the items-to-move category tabs should stay pinned at the top

    Examples:
      | service  |
      | standard |
      | disposal |

  @embedded
  Scenario Outline: <service> category tabs stay pinned when scrolling (embedded WebView)
    Given I am on the "<service>" items-to-move step at mobile width with embedded "true"
    When I scroll the items-to-move list to the bottom
    Then the items-to-move list should have scrolled
    And the items-to-move category tabs should stay pinned at the top

    Examples:
      | service  |
      | standard |
      | disposal |
