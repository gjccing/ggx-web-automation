import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  clickHomepageCta,
  openHomepage,
  selectService,
} from "../lib/pages/homepage.js";
import { readCarryDistanceOptions } from "../lib/pages/address-picker.js";
import {
  clickWizardNext,
  fillMoveDetailsStep,
} from "../lib/pages/wizard.js";
import { movingLabels } from "../lib/labels.js";
import {
  stdMovingWaypoints,
  type WaypointFixture,
} from "../lib/test-data/order-fixture.js";
import {
  bet4380CarryDistanceOptions,
  parseBet4380Locale,
} from "../lib/test-data/bet-4380.js";

const { Given, When, Then } = createBdd();

let observedCarryDistanceOptions: string[] = [];

function waypointLabel(name: string): RegExp {
  if (name === "From") return movingLabels.from;
  if (name === "To") return movingLabels.to;
  throw new Error(`Unsupported waypoint "${name}" — use "From" or "To"`);
}

/** Same fixtures as std-moving, but with the optional carry-distance omitted. */
function waypointWithoutDistance(fixture: WaypointFixture): WaypointFixture {
  const { distance: _distance, ...rest } = fixture;
  return rest;
}

Given(
  "I open the GGX Moving standard moving move details in {string}",
  async ({ page }, locale: string) => {
    const l = parseBet4380Locale(locale);
    await openHomepage(page, l);
    await selectService(page, "standard");
    await clickHomepageCta(page);
    await expect(page).toHaveURL(/std-moving\/move-details/);
  },
);

When(
  "I open the carry-distance options for the {string} waypoint",
  async ({ page }, waypoint: string) => {
    observedCarryDistanceOptions = await readCarryDistanceOptions(
      page,
      waypointLabel(waypoint),
    );
  },
);

Then(
  "the carry-distance option list in {string} should be the updated set",
  async ({}, locale: string) => {
    const l = parseBet4380Locale(locale);
    expect(observedCarryDistanceOptions).toEqual(
      bet4380CarryDistanceOptions[l],
    );
  },
);

When(
  "I fill both waypoints without selecting a carry-distance and continue",
  async ({ page }) => {
    test.setTimeout(120_000);
    await fillMoveDetailsStep(
      page,
      waypointWithoutDistance(stdMovingWaypoints.from),
      waypointWithoutDistance(stdMovingWaypoints.to),
    );
    await clickWizardNext(page);
  },
);

Then("the wizard should advance to the items-to-move step", async ({ page }) => {
  await expect(page).toHaveURL(/items-to-move/);
});
