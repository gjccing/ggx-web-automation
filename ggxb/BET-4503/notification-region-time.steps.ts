import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { ggxbBet4503TestUser, type GgxbRegion } from "../env.js";
import { loginViaUi } from "../lib/auth.js";
import {
  findCreatedOrderNotification,
  openNotificationPanel,
  overrideBrowserTimeZone,
  readOrderPlacedTime,
} from "../lib/pages/notifications.js";

const { Given, When, Then } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

Given(
  "I am logged in to GGXB {string} in English as the BET-4503 user with browser time zone {string}",
  async ({ page }, region: string, timeZone: string) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await overrideBrowserTimeZone(page, timeZone);
    await loginViaUi(page, parseRegion(region), {
      english: true,
      credentials: ggxbBet4503TestUser(),
    });
    const resolved = await page.evaluate(
      () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    expect(resolved).toBe(timeZone);
  },
);

When("I open the notifications panel", async ({ page }) => {
  await openNotificationPanel(page);
});

Then(
  "the {string} notification time should match the order placed time with an {string} suffix",
  async ({ page }, createdLabel: string, suffix: string) => {
    const notification = await findCreatedOrderNotification(page, createdLabel);
    expect(notification.timeText, notification.orderId).toContain(suffix);
    expect(notification.timeText).not.toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);

    const orderPlacedTime = await readOrderPlacedTime(page, "hk", notification.orderId);
    expect(orderPlacedTime).toContain(suffix);
    expect(notification.timeText).toBe(orderPlacedTime);
  },
);
