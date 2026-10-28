import { test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  expectTransportCancelConfirmationOpen,
  expectTransportDrawerBodyVisible,
  getTransportOrderId,
  openTransportCancelConfirmation,
  reopenPendingTransportOrder,
} from "../lib/pages/transport-order-management.js";

const { Before, After, When, Then } = createBdd();

let drawerOpenedAt = 0;
let contentReadyAt = 0;
let orderId = "";

Before(() => {
  test.setTimeout(360_000);
  drawerOpenedAt = 0;
  contentReadyAt = 0;
  orderId = "";
});

When(
  "I reopen that pending transport order from order management",
  async ({ page }) => {
    orderId = await getTransportOrderId(page);
    const timing = await reopenPendingTransportOrder(page, "hk", orderId);
    drawerOpenedAt = timing.drawerOpenedAt;
    contentReadyAt = timing.contentReadyAt;
  },
);

When("I open the cancel order confirmation", async ({ page }) => {
  await openTransportCancelConfirmation(page);
});

When(
  "I wait until 2 minutes have passed since the transport order drawer was opened",
  async ({ page }) => {
    // The drawer schedules its refresh for 120s after the body is shown.
    // Stay past both "2 minutes since open" and that refresh.
    const deadline = Math.max(drawerOpenedAt + 130_000, contentReadyAt + 125_000);
    while (Date.now() < deadline) {
      await expectTransportCancelConfirmationOpen(page);
      await expectTransportDrawerBodyVisible(page, orderId);
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      await page.waitForTimeout(Math.min(500, remaining));
    }
  },
);

Then("the cancel order confirmation should still be open", async ({ page }) => {
  await expectTransportCancelConfirmationOpen(page);
});

Then(
  "the transport order drawer should still show its loaded content",
  async ({ page }) => {
    await expectTransportDrawerBodyVisible(page, orderId);
  },
);

After(async ({ page }) => {
  if (!orderId) return;
  try {
    const confirm = page.locator('[data-cy="confirm-canel-btn"]');
    if (await confirm.isVisible().catch(() => false)) {
      await confirm.click();
    } else {
      const cancel = page.locator('[data-cy="cancel-order-btn"]');
      if (!(await cancel.isVisible().catch(() => false))) return;
      await cancel.click();
      await confirm.click();
    }
    await page.getByText(/Order cancelled/i).waitFor({ timeout: 20_000 });
  } catch {
    // Best-effort cleanup so a placed order is not left pending.
  }
});
