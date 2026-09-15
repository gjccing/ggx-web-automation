import { createBdd } from "playwright-bdd";
import { test } from "@playwright/test";
import { createFixedDiscountVoucherCode } from "../lib/admin/pages/voucher-code.js";
import { navigateToTransportOrder } from "../lib/navigation/side-menu.js";
import { dismissNotifications } from "../lib/pages/notifications.js";
import {
  expectCouponAppliedFeedbackToastDidNotAppear,
  expectNoCouponAppliedOnSummary,
  redeemCouponCodeInModal,
  waitForTransportToastsToClear,
  watchCouponAppliedFeedbackToast,
} from "../lib/pages/transport-order-coupon.js";
import {
  buildTransportOrderToSummary,
  clickPlaceTransportOrder,
} from "../lib/pages/transport-order.js";
import { expectOnTransportOrderDetail } from "../lib/pages/transport-order-management.js";
import {
  bet4451Context,
  resetBet4451Context,
} from "../lib/test-data/bet-4451-context.js";
import { BET4451_VOUCHER_RULES } from "../lib/test-data/bet-4451.js";
import { transportOrderFixture } from "../lib/test-data/transport-order.js";
import { type GgxbRegion } from "../env.js";

const { Given, When, Then } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

Given(
  "a fixed-discount voucher for BET-4451 exists in the GGXB {string} admin panel",
  async ({ page }, region: string) => {
    test.setTimeout(300_000);
    resetBet4451Context();
    const input = await createFixedDiscountVoucherCode(
      page,
      parseRegion(region),
      BET4451_VOUCHER_RULES,
      {
        title: "BET-4451 stale voucher toast",
      },
    );
    bet4451Context.voucherCode = input.code;
    bet4451Context.voucherTitle = input.title;
  },
);

When("I redeem the BET-4451 voucher code in the coupon modal", async ({ page }) => {
  if (!bet4451Context.voucherCode) {
    throw new Error("BET-4451 voucher code is not set — run the admin setup step first");
  }
  await redeemCouponCodeInModal(page, bet4451Context.voucherCode);
});

When("I place the current transport order", async ({ page }) => {
  await clickPlaceTransportOrder(page);
  await dismissNotifications(page);
  await expectOnTransportOrderDetail(page);
  await waitForTransportToastsToClear(page);
});

When(
  "I start a new transport order to summary for {string} without a coupon",
  async ({ page }, region: string) => {
    const r = parseRegion(region);
    bet4451Context.couponAppliedToastWatch = watchCouponAppliedFeedbackToast(page);
    await navigateToTransportOrder(page, r);
    await buildTransportOrderToSummary(page, transportOrderFixture[r], {
      wasteRequirement: false,
    });
  },
);

Then("the coupon-applied feedback toast should not have appeared", async ({ page }) => {
  const watch = bet4451Context.couponAppliedToastWatch;
  if (!watch) {
    throw new Error("Coupon-applied toast watcher was not started");
  }
  await expectCouponAppliedFeedbackToastDidNotAppear(page, watch);
});

Then("the transport order summary should not show a coupon applied", async ({ page }) => {
  if (!bet4451Context.voucherTitle) {
    throw new Error("BET-4451 voucher title is not set — run the admin setup step first");
  }
  await expectNoCouponAppliedOnSummary(page, bet4451Context.voucherTitle);
});
