import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  clickHomepageCta,
  openHomepage,
  selectService,
} from "../lib/pages/homepage.js";
import {
  clickWizardNext,
  fillMoveDetailsStep,
} from "../lib/pages/wizard.js";
import { getSessionStorage } from "../lib/session.js";
import { stdMovingWaypoints } from "../lib/test-data/order-fixture.js";
import {
  categoryTabs,
  confirmItemsBuilder,
  openItemsCategory,
  setSimpleItemQuantity,
  type CategoryName,
} from "../lib/pages/items-to-move.js";
import {
  expectMixpanelEvent,
  getCapturedMixpanelEvents,
} from "../lib/tracking/mixpanel.js";
import {
  BET_4141_FURNITURE_ITEM,
  BET_4141_ITEM_QUANTITY,
  ITEMS_BUILDER_COMPLETED_REQUIRED_PROPERTIES,
} from "../lib/test-data/bet-4141.js";

const { Given, When, Then } = createBdd();

Given("I am on the standard items-to-move step", async ({ page }) => {
  await openHomepage(page, "en-HK");
  await selectService(page, "standard");
  await clickHomepageCta(page);
  await fillMoveDetailsStep(
    page,
    stdMovingWaypoints.from,
    stdMovingWaypoints.to,
  );

  await expect
    .poll(
      async () => {
        const v = await getSessionStorage<{
          from?: { address?: string };
          to?: { address?: string };
          date?: string;
          time?: string;
        }>(page, "std-moving");
        return (
          !!v?.from?.address && !!v?.to?.address && !!v?.date && !!v?.time
        );
      },
      { timeout: 10_000 },
    )
    .toBe(true);

  await clickWizardNext(page);
  await expect(page).toHaveURL(/items-to-move/);
  await expect(categoryTabs(page).first()).toBeVisible({ timeout: 15_000 });
});

When("I open the Furniture category on items-to-move", async ({ page }) => {
  await openItemsCategory(page, "Furniture" satisfies CategoryName);
});

When(
  "I set the quantity of {string} to {int}",
  async ({ page }, itemName: string, quantity: number) => {
    expect(itemName).toBe(BET_4141_FURNITURE_ITEM);
    expect(quantity).toBe(BET_4141_ITEM_QUANTITY);
    await setSimpleItemQuantity(page, itemName, quantity);
  },
);

When("I confirm the items builder", async ({ page }) => {
  await confirmItemsBuilder(page);
});

Then(
  "the Mixpanel event {string} should report total_items_counted as {int}",
  async ({ page }, eventName: string, expectedTotal: number) => {
    try {
      const event = await expectMixpanelEvent(
        page,
        eventName,
        [...ITEMS_BUILDER_COMPLETED_REQUIRED_PROPERTIES],
      );

      expect(event.properties.total_items_counted).toBe(expectedTotal);
      // Quantity 2 of one SKU → unique_items stays 1 (proves we assert sum, not uniqueness).
      expect(event.properties.unique_items).toBe(1);
      expect(event.properties.avg_quantity_per_item).toBe(expectedTotal);
      expect(event.properties.has_others_items).toBe(false);
    } catch (error) {
      const captured = getCapturedMixpanelEvents(page);
      const names = captured.map((e) => e.event);
      const matched = captured.find((e) => e.event === eventName);
      throw new Error(
        `${error instanceof Error ? error.message : String(error)}\n` +
          `Captured Mixpanel events: ${JSON.stringify(names)}\n` +
          `${eventName} props: ${JSON.stringify(matched?.properties ?? null)}`,
      );
    }
  },
);
