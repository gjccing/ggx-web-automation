@BET-4141 @std-moving @hk @tracking
Feature: BET-4141 items_builder_completed total_items_counted sums quantities

  Completing the items builder after selecting quantity > 1 of the same
  furniture item should fire Mixpanel "items_builder_completed" with
  total_items_counted equal to the sum of quantities (not unique item count).

  Scenario: Two of one furniture item reports total_items_counted as 2
    Given a fresh GGX Moving test run
    And Mixpanel tracking is captured
    And I am on the standard items-to-move step
    When I open the Furniture category on items-to-move
    And I set the quantity of "Office chair" to 2
    And I confirm the items builder
    Then the Mixpanel event "items_builder_completed" should report total_items_counted as 2
