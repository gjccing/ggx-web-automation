import { expect, type Page, type Route } from "@playwright/test";
import { ggxbBaseUrl, type GgxbRegion } from "../../env.js";
import { ensureEnglish } from "../navigation/side-menu.js";

const LOADING_DELAY_MS = 4_000;

function downloadReportDropdown(page: Page) {
  return page.getByTestId("download-report-dropdown");
}

async function delayRoute(route: Route, ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
  await route.continue();
}

export async function navigateToTransportOrderManagement(
  page: Page,
  region: GgxbRegion,
): Promise<void> {
  if (region === "hk") {
    await ensureEnglish(page);
  }

  const base = ggxbBaseUrl(region).replace(/\/$/, "");
  const nav = page.getByTestId("navigation-bar-van-order-management");
  if (await nav.isVisible().catch(() => false)) {
    await nav.click();
  } else {
    await page.goto(`${base}/orders`);
  }

  await expect(page).toHaveURL(/\/orders(?:\/|$|\?|#)/, { timeout: 30_000 });
  await expect(downloadReportDropdown(page)).toBeVisible({ timeout: 30_000 });
  await expectDownloadReportEnabled(page);
}

export async function navigateToDeliveryOrderManagement(
  page: Page,
  region: GgxbRegion,
): Promise<void> {
  if (region === "hk") {
    await ensureEnglish(page);
  }

  const base = ggxbBaseUrl(region).replace(/\/$/, "");
  const nav = page.getByTestId("navigation-bar-delivery-order-management");
  if (await nav.isVisible().catch(() => false)) {
    await nav.click();
  } else {
    await page.goto(`${base}/delivery/order-management`);
  }

  await expect(page).toHaveURL(/\/delivery\/order-management(?:\/|$|\?|#)/, {
    timeout: 30_000,
  });
  await expect(downloadReportDropdown(page)).toBeVisible({ timeout: 30_000 });
  await expectDownloadReportEnabled(page);
}

/** Call after the OM page has finished its initial list load. */
export async function delaySubsequentTransportOrderListRequests(
  page: Page,
): Promise<void> {
  await page.route("**/b2b/order_requests/index**", async (route) => {
    await delayRoute(route, LOADING_DELAY_MS);
  });
}

/** Call after the OM page has finished its initial list load. */
export async function delaySubsequentDeliveryOrderListRequests(
  page: Page,
): Promise<void> {
  await page.route(/\/orders(?:\?|$)/, async (route) => {
    const request = route.request();
    if (request.method() !== "GET") {
      await route.continue();
      return;
    }

    const url = request.url();
    if (
      url.includes("/xlsx") ||
      url.includes("/pdf") ||
      url.includes("/bulk") ||
      url.includes("/waybills") ||
      url.includes("/quote")
    ) {
      await route.continue();
      return;
    }

    await delayRoute(route, LOADING_DELAY_MS);
  });
}

export async function changeOrderStatusFilter(
  page: Page,
  filterTestId: string,
  optionLabel: string,
): Promise<void> {
  const filter = page.getByTestId(filterTestId);
  await expect(filter).toBeVisible();
  await filter.getByTestId("dropdown-wrapper").click();
  await expect(filter.getByTestId("dropdown-menu")).toBeVisible();
  await filter
    .getByTestId("dropdown-option")
    .filter({ hasText: new RegExp(`^${optionLabel}$`) })
    .click();
}

export async function expectDownloadReportEnabled(page: Page): Promise<void> {
  const dropdown = downloadReportDropdown(page);
  await expect(dropdown).toBeVisible();
  // react-select keeps a visually hidden dummy input; assert by attribute, not visibility.
  await expect(dropdown.locator("input[disabled]")).toHaveCount(0, {
    timeout: 30_000,
  });
}

export async function expectDownloadReportMenuClosedWhileLoading(
  page: Page,
): Promise<void> {
  const dropdown = downloadReportDropdown(page);
  await expect(dropdown).toBeVisible();

  // Dummy input is CSS-hidden but gets the native `disabled` attribute when loading.
  await expect(dropdown.locator("input[disabled]")).toBeAttached({
    timeout: 10_000,
  });

  await dropdown.getByTestId("dropdown-wrapper").click({ force: true });
  await expect(dropdown.getByTestId("dropdown-menu")).toHaveCount(0);
}
