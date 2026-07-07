@BET-4380 @std-moving @hk @i18n
Feature: BET-4380 Update carry-distance option list

  The "Distance from parking to door" (離泊車位距離) field in the Standard moving
  address dialog offers the updated option set (on-premises parking / 50 m or less /
  51-100 m / more than 100 m). The field stays optional.

  Background:
    Given a fresh GGX Moving test run

  @en-HK
  Scenario: Carry-distance shows the updated option list in English
    Given I open the GGX Moving standard moving move details in "en-HK"
    When I open the carry-distance options for the "From" waypoint
    Then the carry-distance option list in "en-HK" should be the updated set

  @zh-HK
  Scenario: Carry-distance shows localised option labels in Traditional Chinese
    Given I open the GGX Moving standard moving move details in "zh-HK"
    When I open the carry-distance options for the "From" waypoint
    Then the carry-distance option list in "zh-HK" should be the updated set

  @en-HK
  Scenario: Move details is accepted when the carry-distance is skipped
    Given I open the GGX Moving standard moving move details in "en-HK"
    When I fill both waypoints without selecting a carry-distance and continue
    Then the wizard should advance to the items-to-move step
