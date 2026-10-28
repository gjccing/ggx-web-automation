import { expect, type Page } from "@playwright/test";
import type { TransportWaypointFixture } from "../test-data/transport-order.js";
import { dismissNotifications } from "./notifications.js";

export const transportOrderLabels = {
  nextButton: /^Next$|^下一步$/,
  reviewOrderButton: /^Review order$|^檢視訂單$/,
  placeOrderButton: /^Place order$|^落單$/,
  confirmButton: /^Confirm$|^確認$/,
};

async function addressInput(page: Page, waypoint: "from" | "to") {
  const index = waypoint === "from" ? 0 : 1;
  return page.getByPlaceholder(/Address|地址/).nth(index);
}

async function dismissAddressSuggestions(page: Page): Promise<void> {
  await page.keyboard.press("Escape");
  await page
    .locator('[role="listbox"]')
    .first()
    .waitFor({ state: "hidden", timeout: 5_000 })
    .catch(() => {});
}

export async function setTransportWaypointAddress(
  page: Page,
  waypoint: "from" | "to",
  address: string,
): Promise<void> {
  const input = await addressInput(page, waypoint);
  // Saved-address suggestions stay open and cover the next waypoint input.
  await dismissAddressSuggestions(page);
  await input.scrollIntoViewIfNeeded();
  try {
    await input.click({ timeout: 8_000 });
  } catch {
    await dismissAddressSuggestions(page);
    await input.click({ force: true });
  }
  await input.fill(address);

  const suggestion = page
    .locator("li")
    .filter({ has: page.getByTestId("location-suggestion-icon") })
    .first();
  await expect(suggestion).toBeVisible({ timeout: 15_000 });
  await suggestion.click();

  await expect(input).not.toHaveValue("", { timeout: 15_000 });
  await dismissAddressSuggestions(page);
}

export async function fillTransportFromWaypoint(
  page: Page,
  fixture: TransportWaypointFixture,
): Promise<void> {
  await setTransportWaypointAddress(page, "from", fixture.address);
  await page.getByPlaceholder(/Floor\/Room|樓\/室/).first().fill(fixture.floorRoom);
  await page.getByPlaceholder(/Contact name|聯絡人/).first().fill(fixture.contactName);
  await page.getByPlaceholder(/Phone number|電話號碼/).first().fill(fixture.phone);
}

export async function fillTransportToWaypoint(
  page: Page,
  fixture: TransportWaypointFixture,
): Promise<void> {
  await setTransportWaypointAddress(page, "to", fixture.address);
}

export async function selectTransportWasteRequirement(page: Page): Promise<void> {
  await page
    .getByRole("dialog")
    .filter({ hasText: /Loading/i })
    .waitFor({ state: "hidden", timeout: 30_000 })
    .catch(() => {});

  const wasteOption = page.getByText(/Transport or dispose waste/i).first();
  await expect(wasteOption).toBeVisible({ timeout: 15_000 });
  await wasteOption.click({ force: true });
}

export async function buildTransportOrderToSummary(
  page: Page,
  fixture: { from: TransportWaypointFixture; to: TransportWaypointFixture },
  options?: { wasteRequirement?: boolean },
): Promise<void> {
  await fillTransportFromWaypoint(page, fixture.from);
  await fillTransportToWaypoint(page, fixture.to);
  await page.getByRole("button", { name: transportOrderLabels.nextButton }).click();

  await page
    .getByRole("dialog")
    .filter({ hasText: /Loading/i })
    .waitFor({ state: "hidden", timeout: 30_000 })
    .catch(() => {});

  if (options?.wasteRequirement === true) {
    await selectTransportWasteRequirement(page);
  }

  await proceedToTransportOrderSummary(page, { onOrderDetails: true });
}

async function dismissTunnelPreferenceModal(page: Page): Promise<void> {
  const heading = page.getByRole("heading", {
    name: /Add tunnel preference/i,
  });

  try {
    await heading.waitFor({ state: "visible", timeout: 10_000 });
  } catch {
    return;
  }

  const tunnelOption = page
    .getByText(/Eastern Harbour Crossing|東區海底隧道/i)
    .first();
  if (await tunnelOption.isVisible().catch(() => false)) {
    await tunnelOption.click();
  } else {
    await page.getByText(/^No preference$/i).first().click();
  }

  await page
    .getByRole("button", { name: transportOrderLabels.confirmButton })
    .click();
  await heading.waitFor({ state: "hidden", timeout: 15_000 });
}

export async function proceedToTransportOrderSummary(
  page: Page,
  options?: { onOrderDetails?: boolean },
): Promise<void> {
  if (!options?.onOrderDetails) {
    await dismissNotifications(page);
    const next = page.getByRole("button", { name: transportOrderLabels.nextButton });
    try {
      await next.click({ timeout: 8_000 });
    } catch {
      await dismissNotifications(page);
      await next.click({ force: true });
    }
  }

  await dismissNotifications(page);
  await page
    .getByRole("button", { name: transportOrderLabels.reviewOrderButton })
    .click();
  await dismissTunnelPreferenceModal(page);

  const placeBtn = page.getByRole("button", {
    name: transportOrderLabels.placeOrderButton,
  });
  if (!(await placeBtn.isVisible().catch(() => false))) {
    await page
      .getByRole("button", { name: transportOrderLabels.reviewOrderButton })
      .click();
    await dismissTunnelPreferenceModal(page);
  }

  await expect(placeBtn).toBeVisible({ timeout: 15_000 });
}

async function ensureTransportOrderPlaceable(page: Page): Promise<void> {
  const placeBtn = page.getByRole("button", {
    name: transportOrderLabels.placeOrderButton,
  });
  if (await placeBtn.isEnabled()) {
    return;
  }

  // Copy uses non-breaking spaces, so match the error test id.
  const insufficientWallet = page.getByTestId("payment-method-error-msg");
  if (await insufficientWallet.isVisible().catch(() => false)) {
    await page.getByText(/^Wallet$/).first().click();
    const modal = page.getByTestId("pay-with-modal-wrapper");
    await expect(modal).toBeVisible({ timeout: 15_000 });
    // The card radio is display:none, so Playwright will not click it.
    await modal.locator('input[type="radio"]').first().evaluate((el) => {
      if (el instanceof HTMLInputElement) el.click();
    });
    await modal.getByRole("button", { name: /^(OK|Confirm)$/ }).click();
    await expect(modal).toBeHidden({ timeout: 15_000 });
    await expect(insufficientWallet).toBeHidden({ timeout: 15_000 });
  }

  await expect(placeBtn).toBeEnabled({ timeout: 15_000 });
}

export async function clickPlaceTransportOrder(page: Page): Promise<void> {
  await ensureTransportOrderPlaceable(page);
  await page
    .getByRole("button", { name: transportOrderLabels.placeOrderButton })
    .click();
  await expect(page.getByText(/Order placed/i)).toBeVisible({ timeout: 30_000 });
}
