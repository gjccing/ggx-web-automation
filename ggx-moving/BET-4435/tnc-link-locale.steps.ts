import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  homepageServiceCard,
  homepageServiceTncLink,
} from "../lib/pages/homepage.js";
import {
  bet4435ObsoleteLinkLabels,
  bet4435TncLabel,
  bet4435TncUrl,
  parseBet4435Locale,
  parseBet4435Service,
  tncHrefPattern,
} from "../lib/test-data/bet-4435.js";

const { Then } = createBdd();

Then(
  "the selected {string} T&C link should use the {string} label",
  async ({ page }, service: string, locale: string) => {
    const key = parseBet4435Service(service);
    const lang = parseBet4435Locale(locale);
    const label = bet4435TncLabel[lang];
    const card = homepageServiceCard(page, key);
    const link = homepageServiceTncLink(page, key, label);

    await expect(link).toBeVisible();
    await expect(link).toHaveText(label);

    for (const obsolete of bet4435ObsoleteLinkLabels[lang]) {
      await expect(card.getByText(obsolete, { exact: true })).toHaveCount(0);
    }
  },
);

Then(
  "the selected {string} T&C link should open the {string} terms page",
  async ({ page }, service: string, locale: string) => {
    const key = parseBet4435Service(service);
    const lang = parseBet4435Locale(locale);
    const link = homepageServiceTncLink(page, key, bet4435TncLabel[lang]);

    await expect(link).toHaveAttribute("href", tncHrefPattern(bet4435TncUrl[lang]));
  },
);
