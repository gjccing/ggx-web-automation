import { createBdd } from "playwright-bdd";
import {
  enterHomepageViaLocaleUrl,
  expectStoredLocale,
  expectUrlLocale,
  openHomepage,
} from "../lib/pages/homepage.js";
import { parseBet4394Locale } from "../lib/test-data/bet-4394.js";

const { Given, When, Then } = createBdd();

Given(
  "I previously opened GGX Moving in {string}",
  async ({ page }, locale: string) => {
    const l = parseBet4394Locale(locale);
    await openHomepage(page, l);
    await expectStoredLocale(page, l);
  },
);

When(
  "I enter GGX Moving via the {string} language URL",
  async ({ page }, locale: string) => {
    await enterHomepageViaLocaleUrl(page, parseBet4394Locale(locale));
  },
);

Then(
  "the GGX Moving page URL should use locale {string}",
  async ({ page }, locale: string) => {
    const l = parseBet4394Locale(locale);
    // Locale's client effect may replaceState after paint; UI Then already
    // waited for hydration, then re-check so a late rewrite still fails.
    await expectUrlLocale(page, l);
    await page.waitForTimeout(500);
    await expectUrlLocale(page, l);
  },
);
