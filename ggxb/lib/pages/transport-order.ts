import { expect, type Page } from "@playwright/test";
import type { TransportWaypointFixture } from "../test-data/transport-order.js";

export const transportOrderLabels = {
  nextButton: /^Next$|^下一步$/,
  reviewOrderButton: /^Review order$|^檢視訂單$/,
  placeOrderButton: /^Place order$|^落單$/,
  confirmButton: /^Confirm$|^確認$/,
};

async function addressInput(page: Page, waypoint: "from" | "to") {
  const index = waypoint === "from" ? 0 : 1;
  return page.getByPlaceholder("Address").nth(index);
}

export async function setTransportWaypointAddress(
  page: Page,
  waypoint: "from" | "to",
  address: string,
): Promise<void> {
  const input = await addressInput(page, waypoint);
  await input.click();
  await input.fill(address);

  const suggestion = page
    .locator("li")
    .filter({ has: page.getByTestId("location-suggestion-icon") })
    .first();
  await expect(suggestion).toBeVisible({ timeout: 15_000 });
  await suggestion.click();

  await expect(input).not.toHaveValue("", { timeout: 15_000 });
}

export async function fillTransportFromWaypoint(
  page: Page,
  fixture: TransportWaypointFixture,
): Promise<void> {
  await setTransportWaypointAddress(page, "from", fixture.address);
  await page.getByPlaceholder("Floor/Room").first().fill(fixture.floorRoom);
  await page.getByPlaceholder("Contact name").first().fill(fixture.contactName);
  await page.getByPlaceholder("Phone number").first().fill(fixture.phone);
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
    await page.getByRole("button", { name: transportOrderLabels.nextButton }).click();
  }

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

  const insufficientWallet = page.getByText(/wallet balance is insufficient/i);
  if (await insufficientWallet.isVisible().catch(() => false)) {
    const payWithSection = page
      .getByTestId("vanbooking-sidebar-summary-container")
      .or(page.locator('[data-testid="main-content"]'));
    const cardOption = payWithSection
      .getByText(/⋅⋅⋅⋅|Visa|Mastercard|Card/i)
      .first();
    if (await cardOption.isVisible().catch(() => false)) {
      await cardOption.click();
    } else {
      await page.getByText(/^Wallet$/i).first().click();
      await page
        .getByText(/⋅⋅⋅⋅|Visa|Mastercard/i)
        .first()
        .click();
    }
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
