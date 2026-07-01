import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { type GgxbRegion } from "../../env.js";
import { navigateToDeliveryOrder } from "../../lib/navigation/side-menu.js";
import { dismissNotifications } from "../../lib/pages/notifications.js";
import {
  cancelPlacedDeliveryOrder,
  expectOnDeliveryOrderDetail,
  getDeliveryOrderId,
  getDeliveryOrderStatus,
  getDeliveryPaymentMethod,
  getDeliveryPickUpCode,
  getDeliveryWaypointAddress,
} from "../../lib/pages/delivery-order-management.js";
import {
  clickPlaceDeliveryOrder,
  fillDeliveryFromWaypoint,
  fillDeliveryPackageDetails,
  fillDeliveryToWaypoint,
  selectDeliveryDropOffInstant,
} from "../../lib/pages/delivery-order.js";
import {
  DELIVERY_ORDER_ID_PATTERN,
  deliveryOrderFixture,
} from "../../lib/test-data/delivery-order.js";

const { When, Then } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

When(
  "I place a minimal delivery order for {string}",
  async ({ page }, region: string) => {
    const r = parseRegion(region);
    const fixture = deliveryOrderFixture[r];

    await navigateToDeliveryOrder(page, r);
    await fillDeliveryFromWaypoint(page, fixture.from);
    await fillDeliveryToWaypoint(page, fixture.to);
    await fillDeliveryPackageDetails(page, fixture.package);
    await selectDeliveryDropOffInstant(page);
    await clickPlaceDeliveryOrder(page);
    await dismissNotifications(page);
    await expectOnDeliveryOrderDetail(page);
  },
);

Then(
  "the delivery order detail should show the placed route for {string}",
  async ({ page }, region: string) => {
    const r = parseRegion(region);
    const fixture = deliveryOrderFixture[r];

    const pickup = await getDeliveryWaypointAddress(page, 1);
    const dropoff = await getDeliveryWaypointAddress(page, 2);

    expect(pickup).toMatch(new RegExp(fixture.from.address.slice(0, 8), "i"));
    expect(dropoff).toMatch(new RegExp(fixture.to.address.slice(0, 8), "i"));
  },
);

Then("the delivery order id should match the expected format", async ({ page }) => {
  const orderId = await getDeliveryOrderId(page);
  expect(orderId).toMatch(DELIVERY_ORDER_ID_PATTERN);
});

Then("the delivery order pick-up code should be present", async ({ page }) => {
  const pickUpCode = await getDeliveryPickUpCode(page);
  expect(pickUpCode).toMatch(/^\d{6}$/);
});

Then("the delivery order payment method should be visible", async ({ page }) => {
  const paymentMethod = await getDeliveryPaymentMethod(page);
  expect(paymentMethod.length).toBeGreaterThan(0);
});

When("I cancel the current delivery order", async ({ page }) => {
  await cancelPlacedDeliveryOrder(page);
});

Then(
  "the delivery order status should be {string}",
  async ({ page }, expectedStatus: string) => {
    const status = await getDeliveryOrderStatus(page);
    expect(status).toBe(expectedStatus);
  },
);
