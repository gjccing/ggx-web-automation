@BET-4485 @hk @transport-order
Feature: BET-4485 Transport order drawer ignores notifications for other orders

  # Same browser, two tabs, one signed-in account. Order management starts
  # with no notification pop-ups. Order A is created in the other tab and its
  # "Order has been created" pop-up is left open. Order A's detail is open on
  # "Cancel order?" when order C is created.
  #
  # Order C is not on the filtered order-management page (search is order A),
  # so the list must not refetch. A notification for the open order would
  # refresh that drawer; this scenario is the other-order case.

  Scenario: A notification for a different order leaves the cancel confirmation open
    Given I am logged in to GGXB "hk" as the BET-4485 test user in English
    And transport order management is open in another tab with no notification pop-ups
    When I place a transport order from the address book
    And I leave that order's created notification open and show cancel confirmation
    And I place another transport order from the address book
    Then the cancel confirmation stays open for the first order
    And the open order detail is not fetched again
    And the order list is not refetched for the other order
