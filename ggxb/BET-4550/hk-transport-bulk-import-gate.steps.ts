import { expect, test, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { ggxbBaseUrl } from "../env.js";

const { When, Then } = createBdd();

const FLAG_LABEL = /TransportBulkImport/;
const HK_ORG_EXCEPTION = "1890";
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
  // Split readyTimeout is 10s, then the client dispatches the default off treatment.
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

async function organizationId(page: Page): Promise<string> {
  await ensureDebugMenuOpen(page);
  const idRow = page.getByRole("row", { name: /Organisation Id/ });
  if (!(await idRow.isVisible().catch(() => false))) {
    await page.getByText("Organisation / User Information", { exact: true }).click();
  }
  await expect(idRow).toBeVisible();
  return (await idRow.getByRole("cell").nth(1).innerText()).trim();
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

Then(
  "the transport bulk import entry follows the flag being off for this HK organization",
  async ({ page }) => {
    const orgId = await organizationId(page);
    const link = transportBulkImportLink(page);
    const base = ggxbBaseUrl("hk").replace(/\/$/, "");

    if (orgId === HK_ORG_EXCEPTION) {
      await expect(link).toBeVisible();
      await page.goto(`${base}/van/bulk-import`);
      await expect(page).toHaveURL(/\/van\/bulk-import(?:\/|$|\?|#)/);
      await expect(
        page.getByRole("link", { name: "Download template" }),
      ).toBeVisible();
      return;
    }

    await expect(link).toHaveCount(0);
    await page.goto(`${base}/van/bulk-import`);
    await expect(page).toHaveURL(/\/van\/order(?:\/|$|\?|#)/, {
      timeout: 20_000,
    });
  },
);

Then("the transport bulk import nav item is visible", async ({ page }) => {
  await expect(transportBulkImportLink(page)).toBeVisible();
});

Then("the transport bulk import page stays open", async ({ page }) => {
  const base = ggxbBaseUrl("hk").replace(/\/$/, "");
  await page.goto(`${base}/van/bulk-import`);
  await expect(page).toHaveURL(/\/van\/bulk-import(?:\/|$|\?|#)/, {
    timeout: 20_000,
  });
  await expect(
    page.getByRole("link", { name: "Download template" }),
  ).toBeVisible();
});
