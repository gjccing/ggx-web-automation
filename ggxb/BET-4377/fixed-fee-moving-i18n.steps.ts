import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { navigateToTransportOrder } from "../lib/navigation/side-menu.js";
import {
  expectFixedFeePalletBodyVisible,
  hoverFixedFeeInfoIcon,
  openFixedFeeMovingForVehicle,
  readFixedFeeTooltipText,
  selectFixedFeeOption,
} from "../lib/pages/fixed-fee-moving.js";
import {
  bet4377TooltipSnippets,
  type Bet4377Vehicle,
} from "../lib/test-data/bet-4377.js";
import { transportOrderFixture } from "../lib/test-data/transport-order.js";

const { When, Then } = createBdd();

function parseVehicle(vehicle: string): Bet4377Vehicle {
  if (
    vehicle !== "Van" &&
    vehicle !== "5.5 ton truck" &&
    vehicle !== "9 ton truck"
  ) {
    throw new Error(`Unsupported BET-4377 vehicle "${vehicle}"`);
  }
  return vehicle;
}

function parseBoolean(value: string): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Expected "true" or "false", got "${value}"`);
}

When(
  "I open transport order details with {string} and move goods door-to-door",
  async ({ page }, vehicle: string) => {
    await navigateToTransportOrder(page, "hk");
    await openFixedFeeMovingForVehicle(
      page,
      transportOrderFixture.hk,
      parseVehicle(vehicle),
    );
  },
);

When("I select the fixed fee moving option", async ({ page }) => {
  await selectFixedFeeOption(page);
});

When("I hover the fixed fee info icon", async ({ page }) => {
  await hoverFixedFeeInfoIcon(page);
});

Then(
  "the fixed fee pallet helper text should be visible: {word}",
  async ({ page }, visible: string) => {
    await expectFixedFeePalletBodyVisible(page, parseBoolean(visible));
  },
);

Then(
  "the fixed fee info tooltip for {string} should show the updated copy",
  async ({ page }, vehicle: string) => {
    const v = parseVehicle(vehicle);
    const tooltip = await readFixedFeeTooltipText(page);
    const rules = bet4377TooltipSnippets[v];

    for (const pattern of rules.mustInclude) {
      expect(tooltip).toMatch(pattern);
    }
    for (const pattern of rules.mustExclude ?? []) {
      expect(tooltip).not.toMatch(pattern);
    }
  },
);
