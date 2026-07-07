import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { navigateToTransportOrder } from "../lib/navigation/side-menu.js";
import {
  expectAirportExtraFeeDialogVisible,
  readAirportExtraFeeDialogText,
  selectHongKongAirportOnTransportOrder,
} from "../lib/pages/airport-extra-fee-dialog.js";
import {
  bet4376EnFeeLines,
  bet4376ObsoleteZhFeeFragments,
  bet4376UpdatedZhFeeLines,
  parseBet4376Locale,
} from "../lib/test-data/bet-4376.js";

const { When, Then } = createBdd();

When(
  "I select Hong Kong International Airport on the transport order page in {string}",
  async ({ page }, locale: string) => {
    const l = parseBet4376Locale(locale);
    await navigateToTransportOrder(page, "hk", {
      locale: l === "zh-HK" ? "zh" : "en",
    });
    await selectHongKongAirportOnTransportOrder(page, l);
  },
);

Then(
  "the airport extra fee dialog in {string} should be visible",
  async ({ page }, locale: string) => {
    await expectAirportExtraFeeDialogVisible(page, parseBet4376Locale(locale));
  },
);

Then(
  "the airport extra fee dialog in {string} should show the updated fee wording",
  async ({ page }, locale: string) => {
    const l = parseBet4376Locale(locale);
    const text = await readAirportExtraFeeDialogText(page, l);

    for (const line of bet4376UpdatedZhFeeLines) {
      expect(text).toContain(line);
    }
    for (const obsolete of bet4376ObsoleteZhFeeFragments) {
      expect(text).not.toContain(obsolete);
    }
  },
);

Then(
  "the airport extra fee dialog in {string} should show the expected fee wording",
  async ({ page }, locale: string) => {
    const l = parseBet4376Locale(locale);
    const text = await readAirportExtraFeeDialogText(page, l);

    for (const line of bet4376EnFeeLines) {
      expect(text).toContain(line);
    }
  },
);
