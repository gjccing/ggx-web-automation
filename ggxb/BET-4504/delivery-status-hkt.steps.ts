import { expect, test, type CDPSession } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { ggxbBet4504TestUser, type GgxbRegion } from "../env.js";
import { loginViaUi } from "../lib/auth.js";
import { navigateToDeliveryOrderManagement } from "../lib/pages/order-management-download.js";
import {
  expectDeliveryStatusTimeZoneMatchesShipper,
  searchDeliveryOrders,
  setDeliveryOrderDateRange,
} from "../lib/pages/delivery-order-status-time.js";

const { Given, When, Then } = createBdd();

// Keep the CDP session alive so the timezone override survives navigation.
const timezoneSessions: CDPSession[] = [];

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

Given(
  "the browser time zone is {string}",
  async ({ page }, timeZone: string) => {
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setTimezoneOverride", {
      timezoneId: timeZone,
    });
    timezoneSessions.push(session);
    const resolved = await page.evaluate(
      () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    expect(resolved).toBe(timeZone);
  },
);

Given(
  "I am logged in to GGXB {string} as the BET-4504 test user in English",
  async ({ page }, region: string) => {
    test.setTimeout(120_000);
    await loginViaUi(page, parseRegion(region), {
      english: true,
      credentials: ggxbBet4504TestUser(),
    });
  },
);

When(
  "I open the delivery order management page in {string}",
  async ({ page }, region: string) => {
    await navigateToDeliveryOrderManagement(page, parseRegion(region));
  },
);

When(
  "I set the delivery order date range from {string} to {string}",
  async ({ page }, start: string, end: string) => {
    await setDeliveryOrderDateRange(page, start, end);
  },
);

When("I search delivery orders for {string}", async ({ page }, query: string) => {
  await searchDeliveryOrders(page, query);
});

Then(
  "delivery order {string} status time should include {string} like the shipper time",
  async ({ page }, orderLabel: string, zoneAbbr: string) => {
    await expectDeliveryStatusTimeZoneMatchesShipper(page, orderLabel, zoneAbbr);
  },
);
