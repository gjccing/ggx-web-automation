import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { openHomepage, readStandardMovingBody1 } from "../lib/pages/homepage.js";
import {
  bet4379ObsoleteQuantityPatterns,
  bet4379StandardMovingBody1,
  normalizeBody1Text,
  parseBet4379Locale,
} from "../lib/test-data/bet-4379.js";

const { Given, Then } = createBdd();

Given(
  "I open the GGX Moving homepage in {string}",
  async ({ page }, locale: string) => {
    const l = parseBet4379Locale(locale);
    await openHomepage(page, l);
  },
);

Then(
  "the standard moving body1 description in {string} should show the updated copy",
  async ({ page }, locale: string) => {
    const l = parseBet4379Locale(locale);
    const body1 = normalizeBody1Text(await readStandardMovingBody1(page));
    const expected = normalizeBody1Text(bet4379StandardMovingBody1[l]);

    expect(body1).toBe(expected);

    for (const pattern of bet4379ObsoleteQuantityPatterns[l]) {
      expect(body1).not.toMatch(pattern);
    }
  },
);
