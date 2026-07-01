import { expect, type Page } from "@playwright/test";
import type {
  DeliveryPackageFixture,
  DeliveryWaypointFixture,
} from "../test-data/delivery-order.js";

export const deliveryOrderLabels = {
  placeOrderButton: /^Place order$|^落單$/,
  customPackageSize: /^Custom$|^自訂$/,
  dropOffInstant: /^Instant$|^即時$/,
};

async function addressInput(page: Page, waypoint: "from" | "to") {
  const index = waypoint === "from" ? 0 : 1;
  return page
    .getByPlaceholder(/Building \/ street and number|街道及門牌/i)
    .nth(index);
}

export async function setDeliveryWaypointAddress(
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

export async function fillDeliveryFromWaypoint(
  page: Page,
  fixture: DeliveryWaypointFixture,
): Promise<void> {
  await setDeliveryWaypointAddress(page, "from", fixture.address);
  await page
    .getByPlaceholder(/Floor \/ room|樓層/i)
    .first()
    .fill(fixture.floorRoom);
  await page.getByPlaceholder(/^Name$|^姓名$/).first().fill(fixture.contactName);
  await page
    .getByPlaceholder(/Contact number|聯絡電話/i)
    .first()
    .fill(fixture.phone);
}

export async function fillDeliveryToWaypoint(
  page: Page,
  fixture: DeliveryWaypointFixture,
): Promise<void> {
  await setDeliveryWaypointAddress(page, "to", fixture.address);
  await page
    .getByPlaceholder(/Floor \/ room|樓層/i)
    .nth(1)
    .fill(fixture.floorRoom);
  await page.getByPlaceholder(/^Name$|^姓名$/).nth(1).fill(fixture.contactName);
  await page
    .getByPlaceholder(/Contact number|聯絡電話/i)
    .nth(1)
    .fill(fixture.phone);
}

export async function fillDeliveryPackageDetails(
  page: Page,
  fixture: DeliveryPackageFixture,
): Promise<void> {
  const contentInput = page.getByPlaceholder(
    /e\.g\. electronics, beauty product|例如：電子產品/i,
  );
  await contentInput.fill(fixture.content);
  await contentInput.press("Escape");

  await page
    .getByText(deliveryOrderLabels.customPackageSize)
    .first()
    .click();
  await page.locator('input[name="length"]').fill(fixture.length);
  await page.locator('input[name="width"]').fill(fixture.width);
  await page.locator('input[name="height"]').fill(fixture.height);
  await page.locator('input[name="weight"]').fill(fixture.weight);
}

export async function selectDeliveryDropOffInstant(page: Page): Promise<void> {
  await page.getByText(deliveryOrderLabels.dropOffInstant).first().click();
}

async function ensureDeliveryOrderPlaceable(page: Page): Promise<void> {
  const placeBtn = page.getByRole("button", {
    name: deliveryOrderLabels.placeOrderButton,
  });
  if (await placeBtn.isEnabled()) {
    return;
  }

  const insufficientWallet = page.getByText(/wallet balance is insufficient/i);
  if (await insufficientWallet.isVisible().catch(() => false)) {
    const payWithSection = page.locator('[data-testid="main-content"]');
    const cardOption = payWithSection
      .getByText(/⋅⋅⋅⋅|Visa|Mastercard|Card/i)
      .first();
    if (await cardOption.isVisible().catch(() => false)) {
      await cardOption.click();
    }
  }

  await expect(placeBtn).toBeEnabled({ timeout: 15_000 });
}

export async function clickPlaceDeliveryOrder(page: Page): Promise<void> {
  await ensureDeliveryOrderPlaceable(page);
  await page
    .getByRole("button", { name: deliveryOrderLabels.placeOrderButton })
    .click();
  await expect(page.getByText(/Order placed/i)).toBeVisible({ timeout: 30_000 });
}
