import { expect, test, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { When, Then } = createBdd();

const FLAG_LABEL = /TransportBulkImport/;
let splitDispatchSettled = false;

function transportBulkImportLink(page: Page) {
  return page.locator('a[href="/van/bulk-import"]');
}

async function ensureDebugMenuOpen(page: Page): Promise<void> {
  const row = page.getByRole("row", { name: FLAG_LABEL });
  if (await row.isVisible().catch(() => false)) return;

  const gear = page.locator("a").filter({ hasText: "⚙" });
  await expect(
    gear,
    "Debug menu is missing. Run local b2b-website with ENABLE_DEBUG=true and point GGXB_HK_BASE_URL at it.",
  ).toBeVisible({ timeout: 15_000 });
  await gear.click();
  await expect(row).toBeVisible();
}

async function settleSplitDispatch(page: Page): Promise<void> {
  if (splitDispatchSettled) return;
  // The first Split read dispatches the external treatment. Wait for that
  // before toggling, and do not navigate away: a later read replaces the toggle.
  await page.waitForTimeout(11_000);
  splitDispatchSettled = true;
}

async function setTransportBulkImportFlag(
  page: Page,
  enabled: boolean,
): Promise<void> {
  test.setTimeout(120_000);
  await ensureDebugMenuOpen(page);
  await settleSplitDispatch(page);
  const row = page.getByRole("row", { name: FLAG_LABEL });
  await row
    .getByRole("cell", { name: enabled ? "On" : "Off", exact: true })
    .click();
}

When(
  "I set the transport bulk import feature flag to off",
  async ({ page }) => {
    await setTransportBulkImportFlag(page, false);
  },
);

When(
  "I set the transport bulk import feature flag to on",
  async ({ page }) => {
    await setTransportBulkImportFlag(page, true);
  },
);

Then("the transport bulk import nav item disappears", async ({ page }) => {
  await expect(transportBulkImportLink(page)).toHaveCount(0);
});

Then("the transport bulk import nav item is visible", async ({ page }) => {
  await expect(transportBulkImportLink(page)).toBeVisible();
});
