import { createBdd } from "playwright-bdd";
import { test } from "@playwright/test";
import { loginViaUi } from "../lib/auth.js";
import { cancelPlacedTransportOrder } from "../lib/pages/transport-order-management.js";
import {
  expectCancelConfirmationStays,
  expectOpenOrderNotRefetched,
  expectOrderListNotRefetched,
  openCreatedOrderAndAskToCancel,
  openTransportOrderManagementTab,
  placeTransportOrderFromAddressBook,
} from "../lib/pages/transport-notification-drawer.js";
import { ggxbBet4485TestUser, type GgxbRegion } from "../env.js";
import {
  bet4485Context,
  resetBet4485Context,
} from "../lib/test-data/bet-4485-context.js";

const { Given, When, Then, After } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

Given(
  "I am logged in to GGXB {string} as the BET-4485 test user in English",
  async ({ page }, region: string) => {
    test.setTimeout(180_000);
    resetBet4485Context();
    await loginViaUi(page, parseRegion(region), {
      english: true,
      credentials: ggxbBet4485TestUser(),
    });
  },
);

Given(
  "transport order management is open in another tab with no notification pop-ups",
  async ({ page }) => {
    await openTransportOrderManagementTab(page);
  },
);

When("I place a transport order from the address book", async ({ page }) => {
  bet4485Context.orderA = await placeTransportOrderFromAddressBook(page);
});

When("I place another transport order from the address book", async ({ page }) => {
  bet4485Context.orderC = await placeTransportOrderFromAddressBook(page);
});

When(
  "I leave that order's created notification open and show cancel confirmation",
  async () => {
    const orderA = bet4485Context.orderA;
    if (!orderA) throw new Error("Order A was not placed");
    await openCreatedOrderAndAskToCancel(orderA);
  },
);

Then("the cancel confirmation stays open for the first order", async () => {
  const { orderA, orderC } = bet4485Context;
  if (!orderA || !orderC) throw new Error("Both orders must be placed first");
  await expectCancelConfirmationStays(orderA, orderC);
});

Then("the open order detail is not fetched again", async () => {
  expectOpenOrderNotRefetched();
});

Then("the order list is not refetched for the other order", async () => {
  expectOrderListNotRefetched();
});

After(async ({ page }) => {
  const orders = bet4485Context.ordersPage;
  try {
    if (orders) {
      const confirm = orders.locator('[data-cy="confirm-canel-btn"]');
      if (await confirm.isVisible().catch(() => false)) {
        await confirm.click();
      } else if (await orders.getByText("Cancel order", { exact: true }).first().isVisible().catch(() => false)) {
        await orders.getByText("Cancel order", { exact: true }).first().click();
        if (await confirm.isVisible().catch(() => false)) await confirm.click();
      }
    }
  } catch {
    // Best-effort cleanup of the order left on the management tab.
  }

  try {
    if (await page.getByText("Cancel order", { exact: true }).first().isVisible().catch(() => false)) {
      await cancelPlacedTransportOrder(page);
    }
  } catch {
    // Best-effort cleanup of the order left on the booking tab.
  }
});
