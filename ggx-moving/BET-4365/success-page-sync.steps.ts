import { createBdd } from "playwright-bdd";
import {
  expectBet4333SuccessLayout,
  expectWhatsAppTemplatedContact,
} from "../lib/pages/submitted.js";
import { parseBet4365Locale } from "../lib/test-data/bet-4365.js";

const { Then } = createBdd();

Then(
  "the success page should match the BET-4333 layout in {string}",
  async ({ page }, locale: string) => {
    await expectBet4333SuccessLayout(page, parseBet4365Locale(locale));
  },
);

Then(
  "the WhatsApp contact should open to 64675050 with submission time and contact phone in {string}",
  async ({ page }, locale: string) => {
    await expectWhatsAppTemplatedContact(page, parseBet4365Locale(locale));
  },
);
