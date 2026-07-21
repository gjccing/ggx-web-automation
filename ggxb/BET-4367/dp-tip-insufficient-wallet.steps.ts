import { createBdd } from "playwright-bdd";
import { test } from "@playwright/test";
import { loginViaUi } from "../lib/auth.js";
import { ensureTraditionalChinese } from "../lib/navigation/side-menu.js";
import { openFirstPendingDeliveryOrder } from "../lib/pages/delivery-order-management.js";
import {
  expectInsufficientBalanceWithTipAlert,
  openDeliveryTipModal,
  submitMaxDeliveryTip,
} from "../lib/pages/delivery-tip.js";
import { parseBet4367Locale } from "../lib/test-data/bet-4367.js";
import { ggxbBet4367TestUser, type GgxbRegion } from "../env.js";

const { Given, When, Then } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

Given(
  "I am logged in to GGXB {string} as the BET-4367 test user in English",
  async ({ page }, region: string) => {
    test.setTimeout(120_000);
    await loginViaUi(page, parseRegion(region), {
      english: true,
      credentials: ggxbBet4367TestUser(),
    });
  },
);

Given(
  "I am logged in to GGXB {string} as the BET-4367 test user in Traditional Chinese",
  async ({ page }, region: string) => {
    test.setTimeout(120_000);
    const r = parseRegion(region);
    await loginViaUi(page, r, {
      english: false,
      credentials: ggxbBet4367TestUser(),
    });
    if (r === "hk") {
      await ensureTraditionalChinese(page);
    }
  },
);

When(
  "I open a pending delivery order for tip testing in {string}",
  async ({ page }, region: string) => {
    await openFirstPendingDeliveryOrder(page, parseRegion(region));
  },
);

When(
  "I add a maximum delivery tip in {string}",
  async ({ page }, locale: string) => {
    const l = parseBet4367Locale(locale);
    await openDeliveryTipModal(page, l);
    await submitMaxDeliveryTip(page, l);
  },
);

Then(
  "the insufficient balance with tip alert in {string} should be shown",
  async ({ page }, locale: string) => {
    await expectInsufficientBalanceWithTipAlert(
      page,
      parseBet4367Locale(locale),
    );
  },
);
