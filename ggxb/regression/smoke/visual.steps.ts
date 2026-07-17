import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { ggxbBaseUrl, type GgxbRegion } from "../../env.js";
import {
  openLoginPage,
  switchToEnglishIfAvailable,
} from "../../lib/auth.js";
import {
  pathNeedsFixedDateRange,
  setListDateRange,
} from "../../lib/pages/date-range-filter.js";
import { openFirstCompletedDeliveryOrder } from "../../lib/pages/delivery-order-management.js";
import {
  fillTransportFromWaypoint,
  fillTransportToWaypoint,
  proceedToTransportOrderSummary,
  transportOrderLabels,
} from "../../lib/pages/transport-order.js";
import { openFirstCompletedTransportOrder } from "../../lib/pages/transport-order-management.js";
import { transportOrderFixture } from "../../lib/test-data/transport-order.js";
import { expectUiSnapshot } from "../../lib/visual.js";

const { Given, When, Then } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

Given("a fresh GGXB visual smoke run", async () => {
  // Placeholder for shared context reset if needed later.
});

async function openGgxbPath(
  page: import("@playwright/test").Page,
  region: GgxbRegion,
  path: string,
  options?: { english?: boolean },
): Promise<void> {
  test.setTimeout(180_000);
  const base = ggxbBaseUrl(region).replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath === "/login" || normalizedPath.startsWith("/login?")) {
    await openLoginPage(page, region);
    if (options?.english && region === "hk") {
      await switchToEnglishIfAvailable(page);
    }
    return;
  }

  // Skip navigation when already on the target authenticated route.
  const alreadyThere =
    page.url().includes(normalizedPath) &&
    (await page
      .locator('[data-testid="navigation-bar-footer-menu-user"]')
      .isVisible()
      .catch(() => false));
  if (!alreadyThere) {
    await page.goto(`${base}${normalizedPath}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("domcontentloaded");
  }

  // Public auth pages: prefer English copy on HK for stable baselines.
  if (
    options?.english &&
    region === "hk" &&
    /\/(signup|recovery)/.test(normalizedPath)
  ) {
    await switchToEnglishIfAvailable(page);
  }

  // Authenticated routes must stay signed-in (session bounce → login would poison baselines).
  if (!/\/(login|signup|recovery)(?:\/|$|\?|#)/.test(normalizedPath)) {
    const loadingDialog = page.getByRole("dialog").filter({ hasText: /Loading/i });
    if (await loadingDialog.isVisible().catch(() => false)) {
      await expect(loadingDialog).toBeHidden({ timeout: 45_000 });
    }
    await expect(page).not.toHaveURL(/\/login(?:\?|#|$)/, { timeout: 15_000 });
    await expect(
      page.locator('[data-testid="navigation-bar-footer-menu-user"]'),
    ).toBeVisible({ timeout: 45_000 });
  }

  // Stabilize list pages on a fixed window so baselines don't drift month-to-month.
  if (pathNeedsFixedDateRange(normalizedPath)) {
    await setListDateRange(page);
  }
}

Given(
  "I open the GGXB {string} path {string} in English",
  async ({ page }, region: string, path: string) => {
    await openGgxbPath(page, parseRegion(region), path, { english: true });
  },
);

Given(
  "I open the GGXB {string} path {string}",
  async ({ page }, region: string, path: string) => {
    await openGgxbPath(page, parseRegion(region), path);
  },
);

When(
  "I fill the transport place-order route details for {string}",
  async ({ page }, region: string) => {
    test.setTimeout(180_000);
    const fixture = transportOrderFixture[parseRegion(region)];
    await fillTransportFromWaypoint(page, fixture.from);
    await fillTransportToWaypoint(page, fixture.to);
    await expect(
      page.getByRole("button", { name: transportOrderLabels.nextButton }),
    ).toBeEnabled({ timeout: 15_000 });
  },
);

When(
  "I proceed to the transport place-order order details step",
  async ({ page }) => {
    await page
      .getByRole("button", { name: transportOrderLabels.nextButton })
      .click();
    await page
      .getByRole("dialog")
      .filter({ hasText: /Loading/i })
      .waitFor({ state: "hidden", timeout: 30_000 })
      .catch(() => {});
    await expect(
      page.getByRole("button", { name: transportOrderLabels.reviewOrderButton }),
    ).toBeVisible({ timeout: 30_000 });
  },
);

When(
  "I proceed to the transport place-order summary without placing",
  async ({ page }) => {
    await proceedToTransportOrderSummary(page, { onOrderDetails: true });
    await expect(
      page.getByRole("button", { name: transportOrderLabels.placeOrderButton }),
    ).toBeVisible({ timeout: 15_000 });
  },
);

When("I open the first completed transport order detail", async ({ page }) => {
  test.setTimeout(180_000);
  await openFirstCompletedTransportOrder(page);
});

When("I open the first completed delivery order detail", async ({ page }) => {
  test.setTimeout(180_000);
  await openFirstCompletedDeliveryOrder(page);
});

Then(
  "the UI snapshot {string} should match",
  async ({ page }, name: string) => {
    await expectUiSnapshot(page, name);
  },
);
