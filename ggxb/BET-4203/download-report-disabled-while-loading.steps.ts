import { createBdd } from "playwright-bdd";
import { type GgxbRegion } from "../env.js";
import {
  changeOrderStatusFilter,
  delaySubsequentDeliveryOrderListRequests,
  delaySubsequentTransportOrderListRequests,
  expectDownloadReportMenuClosedWhileLoading,
  navigateToDeliveryOrderManagement,
  navigateToTransportOrderManagement,
} from "../lib/pages/order-management-download.js";

const { When, Then } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

When("I open the transport order management page", async ({ page }) => {
  await navigateToTransportOrderManagement(page, parseRegion("hk"));
});

When("I open the delivery order management page", async ({ page }) => {
  await navigateToDeliveryOrderManagement(page, parseRegion("hk"));
});

When(
  "I delay subsequent transport order list requests",
  async ({ page }) => {
    await delaySubsequentTransportOrderListRequests(page);
  },
);

When(
  "I delay subsequent delivery order list requests",
  async ({ page }) => {
    await delaySubsequentDeliveryOrderListRequests(page);
  },
);

When(
  "I change the transport order status filter to {string}",
  async ({ page }, optionLabel: string) => {
    await changeOrderStatusFilter(
      page,
      "van-order-status-filter-dropdown",
      optionLabel,
    );
  },
);

When(
  "I change the delivery order status filter to {string}",
  async ({ page }, optionLabel: string) => {
    await changeOrderStatusFilter(
      page,
      "delivery-order-filter-dropdown",
      optionLabel,
    );
  },
);

Then(
  "the download report menu should not open while the order table is loading",
  async ({ page }) => {
    await expectDownloadReportMenuClosedWhileLoading(page);
  },
);
