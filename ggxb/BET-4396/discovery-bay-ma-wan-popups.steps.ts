import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { navigateToTransportOrder } from "../lib/navigation/side-menu.js";
import {
  expectRegionWarningDialogVisible,
  readRegionWarningDialogText,
  selectRegionAddressOnTransportOrder,
} from "../lib/pages/region-warning-dialog.js";
import {
  bet4396DialogCopyLines,
  parseBet4396Locale,
  parseBet4396Region,
} from "../lib/test-data/bet-4396.js";

const { When, Then } = createBdd();

When(
  "I select {string} on the transport order page in {string}",
  async ({ page }, regionLabel: string, locale: string) => {
    const region = parseBet4396Region(regionLabel);
    const l = parseBet4396Locale(locale);
    await navigateToTransportOrder(page, "hk", {
      locale: l === "zh-HK" ? "zh" : "en",
    });
    await selectRegionAddressOnTransportOrder(page, region, l);
  },
);

Then(
  "the {string} region warning dialog in {string} should be visible",
  async ({ page }, regionLabel: string, locale: string) => {
    await expectRegionWarningDialogVisible(
      page,
      parseBet4396Region(regionLabel),
      parseBet4396Locale(locale),
    );
  },
);

Then(
  "the {string} region warning dialog in {string} should show the expected wording",
  async ({ page }, regionLabel: string, locale: string) => {
    const region = parseBet4396Region(regionLabel);
    const l = parseBet4396Locale(locale);
    const text = await readRegionWarningDialogText(page, region, l);

    for (const line of bet4396DialogCopyLines[region][l]) {
      expect(text).toContain(line);
    }
  },
);
