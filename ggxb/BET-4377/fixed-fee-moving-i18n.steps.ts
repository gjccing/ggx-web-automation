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
  bet4377TooltipText,
  normalizeTooltipText,
  parseBet4377Locale,
  parseBet4377Vehicle,
} from "../lib/test-data/bet-4377.js";
import { transportOrderFixture } from "../lib/test-data/transport-order.js";

const { When, Then } = createBdd();

function parseBoolean(value: string): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Expected "true" or "false", got "${value}"`);
}

When(
  "I open transport order details in {string} with {string} and move goods door-to-door",
  async ({ page }, locale: string, vehicle: string) => {
    const l = parseBet4377Locale(locale);
    await navigateToTransportOrder(page, "hk", {
      locale: l === "zh-HK" ? "zh" : "en",
    });
    await openFixedFeeMovingForVehicle(
      page,
      transportOrderFixture.hk,
      parseBet4377Vehicle(vehicle),
      l,
    );
  },
);

When(
  "I select the fixed fee moving option in {string}",
  async ({ page }, locale: string) => {
    await selectFixedFeeOption(page, parseBet4377Locale(locale));
  },
);

When(
  "I hover the fixed fee info icon in {string}",
  async ({ page }, locale: string) => {
    await hoverFixedFeeInfoIcon(page, parseBet4377Locale(locale));
  },
);

Then(
  "the fixed fee pallet helper text in {string} should be visible: {word}",
  async ({ page }, locale: string, visible: string) => {
    await expectFixedFeePalletBodyVisible(
      page,
      parseBet4377Locale(locale),
      parseBoolean(visible),
    );
  },
);

Then(
  "the fixed fee info tooltip in {string} for {string} should show the updated copy",
  async ({ page }, locale: string, vehicle: string) => {
    const l = parseBet4377Locale(locale);
    const v = parseBet4377Vehicle(vehicle);
    const tooltip = await readFixedFeeTooltipText(page, l);
    const expected = bet4377TooltipText[l][v];

    expect(normalizeTooltipText(tooltip)).toBe(normalizeTooltipText(expected));
  },
);
