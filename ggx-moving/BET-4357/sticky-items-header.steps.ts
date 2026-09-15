import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  clickHomepageCta,
  openHomepage,
  selectService,
} from "../lib/pages/homepage.js";
import { fillWaypoint } from "../lib/pages/address-picker.js";
import {
  clickWizardNext,
  fillMoveDetailsStep,
  selectMoveDate,
  selectMoveTime,
} from "../lib/pages/wizard.js";
import { movingLabels } from "../lib/labels.js";
import { getSessionStorage } from "../lib/session.js";
import {
  disposalWaypoint,
  stdMovingWaypoints,
} from "../lib/test-data/order-fixture.js";
import {
  MOBILE_VIEWPORT,
  categoryTabs,
  categoryTabsTop,
  expectCategoryTabsPinned,
  scrollItemsListToBottom,
} from "../lib/pages/items-to-move.js";

const { Given, When, Then } = createBdd();

let tabsTopBefore = 0;
let tabsTopAfter = 0;
let listScrolledBy = 0;

Given(
  "I am on the {string} items-to-move step at mobile width with embedded {string}",
  async ({ page }, service: string, embeddedFlag: string) => {
    const embedded = embeddedFlag === "true";
    await page.setViewportSize(MOBILE_VIEWPORT);
    await openHomepage(page, "en-HK", embedded ? "?embedded=true" : "");

    // The `?embedded=true` query hides the site header (language switcher). Assert
    // the mode actually took effect so the two variants exercise different layouts.
    const languageButton = page.getByRole("button", { name: /^(EN|中)$/ });
    if (embedded) {
      await expect(languageButton).toHaveCount(0);
    } else {
      await expect(languageButton).toBeVisible();
    }

    const sessionKey = service === "standard" ? "std-moving" : "disposal-only";

    if (service === "standard") {
      await selectService(page, "standard");
      await clickHomepageCta(page);
      await fillMoveDetailsStep(
        page,
        stdMovingWaypoints.from,
        stdMovingWaypoints.to,
      );
    } else if (service === "disposal") {
      await selectService(page, "disposal");
      await clickHomepageCta(page);
      await fillWaypoint(page, movingLabels.from, disposalWaypoint);
      await selectMoveDate(page);
      await selectMoveTime(page);
    } else {
      throw new Error(`Unsupported service "${service}" — use standard/disposal`);
    }

    // The wizard step guard reads move details from sessionStorage on mount and
    // bounces back to step 1 if they are missing. Wait until the details are
    // persisted before advancing, otherwise items-to-move flakily redirects back.
    await expect
      .poll(
        async () => {
          const v = await getSessionStorage<{
            from?: { address?: string };
            to?: { address?: string };
            date?: string;
            time?: string;
          }>(page, sessionKey);
          const hasWaypoints =
            !!v?.from?.address && (service !== "standard" || !!v?.to?.address);
          return hasWaypoints && !!v?.date && !!v?.time;
        },
        { timeout: 10_000 },
      )
      .toBe(true);

    await clickWizardNext(page);
    await expect(page).toHaveURL(/items-to-move/);
    // The item picker (category tabs + list) mounts asynchronously.
    await expect(categoryTabs(page).first()).toBeVisible({ timeout: 15_000 });
    // Guard against a post-navigation redirect settling back to step 1.
    await expect(page).toHaveURL(/items-to-move/);
  },
);

When("I scroll the items-to-move list to the bottom", async ({ page }) => {
  tabsTopBefore = await categoryTabsTop(page);
  listScrolledBy = await scrollItemsListToBottom(page);
  tabsTopAfter = await categoryTabsTop(page);
});

Then("the items-to-move list should have scrolled", async () => {
  expect(listScrolledBy).toBeGreaterThan(0);
});

Then(
  "the items-to-move category tabs should stay pinned at the top",
  async ({ page }) => {
    await expectCategoryTabsPinned(page, tabsTopBefore, tabsTopAfter);
  },
);
