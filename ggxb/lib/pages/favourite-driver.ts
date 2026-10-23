import { expect, type Page } from "@playwright/test";
import { ggxbBaseUrl } from "../../env.js";
import {
  changeOrderStatusFilter,
  navigateToTransportOrderManagement,
} from "./order-management-download.js";

/** en-HK copy for `notification__name_was_added_to_favourites`. */
export const FAVOURITED_SUCCESS_MESSAGE = "Added to Favourite drivers!";

/** en-HK copy for `notification__name_was_removed_from_favourites`. */
const REMOVED_MESSAGE = "Removed from Favourite drivers";

const FAVOURITED_FILL = "#D61F49";

export type FavouriteHeartState = "favourited" | "not-favourited" | "missing";

function driverDetailName(page: Page) {
  return page.locator("p").filter({ hasText: /^.+ \(\d{5,}\)$/ });
}

/**
 * Read the order-detail heart without waiting for it to change.
 * A missing heart (detail replaced by the loading spinner) is `missing`.
 */
export async function readFavouriteHeartState(
  page: Page,
): Promise<FavouriteHeartState> {
  return page.evaluate((favouritedFill) => {
    const name = [...document.querySelectorAll("p")].find((node) =>
      /^.+ \(\d{5,}\)$/.test(node.textContent?.trim() ?? ""),
    );
    const svg = name?.parentElement?.parentElement?.querySelector(
      "svg:last-of-type",
    );
    const path = svg?.querySelector("path");
    if (!path) return "missing";
    return path.getAttribute("fill") === favouritedFill
      ? "favourited"
      : "not-favourited";
  }, FAVOURITED_FILL);
}

async function waitForHeartState(
  page: Page,
  state: FavouriteHeartState,
): Promise<void> {
  await expect
    .poll(() => readFavouriteHeartState(page), { timeout: 20_000 })
    .toBe(state);
}

/**
 * On transport order management, open the first Active order whose driver
 * column shows an assigned driver.
 */
export async function openTransportOrderWithAssignedDriver(
  page: Page,
): Promise<void> {
  await navigateToTransportOrderManagement(page, "hk");
  await changeOrderStatusFilter(
    page,
    "van-order-status-filter-dropdown",
    "Active",
  );

  const loadingDialog = page.getByRole("dialog").filter({ hasText: /Loading/i });
  if (await loadingDialog.isVisible().catch(() => false)) {
    await expect(loadingDialog).toBeHidden({ timeout: 30_000 });
  }

  const rows = page.locator('[data-testid^="table-row-"]');
  await expect(rows.first()).toBeVisible({ timeout: 30_000 });

  const count = await rows.count();
  let orderId = "";
  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index);
    const driverText = (await row.locator("td").nth(6).innerText()).trim();
    if (!driverText || driverText === "-" || driverText.startsWith("-\n")) {
      continue;
    }
    const testId = (await row.getAttribute("data-testid")) ?? "";
    orderId = testId.replace("table-row-", "");
    if (orderId) break;
  }

  if (!orderId) {
    throw new Error(
      "No assigned driver to favourite on the transport order management page",
    );
  }

  const base = ggxbBaseUrl("hk").replace(/\/$/, "");
  const favouriteList = page.waitForResponse(
    (response) =>
      response.url().includes("/driver_interactions/favourite_drivers") &&
      response.request().method() === "GET",
  );
  await page.goto(`${base}/orders/${orderId}`);
  const name = driverDetailName(page);
  await expect(name).toBeVisible({ timeout: 30_000 });
  const driverName = (await name.innerText())
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
  const listed = await favouriteList.then(async (response) => {
    const body = (await response.json()) as { data?: { name?: string }[] };
    return (body.data ?? []).some((driver) => driver.name === driverName);
  });
  await waitForHeartState(page, listed ? "favourited" : "not-favourited");
}

let heartStateWhenSuccessShown: FavouriteHeartState | undefined;

function favouriteDriversResponse(
  page: Page,
  method: "GET" | "POST" | "DELETE",
) {
  return page.waitForResponse(
    (response) =>
      response.url().includes("/driver_interactions/favourite_drivers") &&
      response.request().method() === method,
  );
}

/** Leave the assigned driver unfavourited, then click the empty heart. */
export async function favouriteAssignedDriver(page: Page): Promise<void> {
  heartStateWhenSuccessShown = undefined;
  if ((await readFavouriteHeartState(page)) === "favourited") {
    const removed = favouriteDriversResponse(page, "DELETE");
    const refreshed = favouriteDriversResponse(page, "GET");
    await clickDriverHeart(page);
    expect((await removed).ok(), "removing the favourite driver").toBeTruthy();
    await refreshed;
    await waitForHeartState(page, "not-favourited");
    await expect(page.getByText(REMOVED_MESSAGE, { exact: true })).toBeHidden({
      timeout: 15_000,
    });
  }

  if ((await readFavouriteHeartState(page)) !== "not-favourited") {
    throw new Error("Assigned driver heart is not ready to favourite");
  }

  await page.evaluate((successMessage) => {
    const favouritedFill = "#D61F49";
    const read = () => {
      const name = [...document.querySelectorAll("p")].find((node) =>
        /^.+ \(\d{5,}\)$/.test(node.textContent?.trim() ?? ""),
      );
      const path = name?.parentElement?.parentElement
        ?.querySelector("svg:last-of-type")
        ?.querySelector("path");
      if (!path) return "missing";
      return path.getAttribute("fill") === favouritedFill
        ? "favourited"
        : "not-favourited";
    };
    const target = window as Window & { __bet4481Heart?: string | null };
    target.__bet4481Heart = null;
    const capture = () => {
      const text = document.querySelector(".Toastify")?.textContent ?? "";
      if (text.includes(successMessage) && target.__bet4481Heart == null) {
        target.__bet4481Heart = read();
      }
    };
    new MutationObserver(capture).observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  }, FAVOURITED_SUCCESS_MESSAGE);

  const added = favouriteDriversResponse(page, "POST");
  await clickDriverHeart(page);
  const addedResponse = await added;
  expect(
    addedResponse.ok(),
    `adding the favourite driver (${addedResponse.status()})`,
  ).toBeTruthy();
  await page.waitForFunction(
    () =>
      (window as Window & { __bet4481Heart?: string | null }).__bet4481Heart !=
      null,
    undefined,
    { timeout: 15_000 },
  );
  heartStateWhenSuccessShown = await page.evaluate(
    () =>
      (window as Window & { __bet4481Heart?: FavouriteHeartState })
        .__bet4481Heart,
  );
}

async function clickDriverHeart(page: Page): Promise<void> {
  const name = driverDetailName(page);
  await expect(name).toBeVisible();
  await name.locator("xpath=ancestor::div[2]").locator("svg").last().click();
}

/**
 * Once the success toast is visible, the heart must already be favourited.
 * Does not wait for a later repaint — the status lag is the bug.
 */
export async function expectFavouriteStatusUpdatedWithSuccessToast(): Promise<void> {
  expect(
    heartStateWhenSuccessShown,
    "favourite status when the success message is shown",
  ).toBe("favourited");
}
