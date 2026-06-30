import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { type GgxbRegion } from "../../env.js";
import { navigateToTransportOrder } from "../../lib/navigation/side-menu.js";
import { dismissNotifications } from "../../lib/pages/notifications.js";
import {
  cancelPlacedTransportOrder,
  expectOnTransportOrderDetail,
  getTransportOrderId,
  getTransportOrderStatus,
  getTransportPaymentMethod,
  getTransportVehicleType,
  getTransportWaypointAddress,
} from "../../lib/pages/transport-order-management.js";
import {
  clickPlaceTransportOrder,
  fillTransportFromWaypoint,
  fillTransportToWaypoint,
  proceedToTransportOrderSummary,
} from "../../lib/pages/transport-order.js";
import {
  TRANSPORT_ORDER_ID_PATTERN,
  transportOrderFixture,
} from "../../lib/test-data/transport-order.js";

const { When, Then } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

When(
  "I place a minimal transport order for {string}",
  async ({ page }, region: string) => {
    const r = parseRegion(region);
    const fixture = transportOrderFixture[r];

    await navigateToTransportOrder(page, r);
    await fillTransportFromWaypoint(page, fixture.from);
    await fillTransportToWaypoint(page, fixture.to);
    await proceedToTransportOrderSummary(page);
    await clickPlaceTransportOrder(page);
    await dismissNotifications(page);
    await expectOnTransportOrderDetail(page);
  },
);

Then(
  "the transport order detail should show the placed route for {string}",
  async ({ page }, region: string) => {
    const r = parseRegion(region);
    const fixture = transportOrderFixture[r];

    const pickup = await getTransportWaypointAddress(page, 1);
    const dropoff = await getTransportWaypointAddress(page, 2);

    expect(pickup).toMatch(new RegExp(fixture.from.address.slice(0, 8), "i"));
    expect(dropoff).toMatch(new RegExp(fixture.to.address.slice(0, 8), "i"));
  },
);

Then("the transport order id should match the expected format", async ({ page }) => {
  const orderId = await getTransportOrderId(page);
  expect(orderId).toMatch(TRANSPORT_ORDER_ID_PATTERN);
});

Then("the transport order vehicle type should be present", async ({ page }) => {
  const vehicleType = await getTransportVehicleType(page);
  expect(vehicleType.length).toBeGreaterThan(0);
});

Then("the transport order payment method should be visible", async ({ page }) => {
  const paymentMethod = await getTransportPaymentMethod(page);
  expect(paymentMethod.length).toBeGreaterThan(0);
});

When("I cancel the current transport order", async ({ page }) => {
  await cancelPlacedTransportOrder(page);
});

Then(
  "the transport order status should be {string}",
  async ({ page }, expectedStatus: string) => {
    const status = await getTransportOrderStatus(page);
    expect(status).toBe(expectedStatus);
  },
);
