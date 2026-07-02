import { createBdd } from "playwright-bdd";
import { test } from "@playwright/test";
import { createFixedDiscountVoucherCode } from "../lib/admin/pages/voucher-code.js";
import { navigateToTransportOrder } from "../lib/navigation/side-menu.js";
import {
  applySelectedCouponInModal,
  expectCouponRedeemNotEligibleMessage,
  expectCouponRedeemSuccessMessage,
  expectTransportCouponAppliedOnSummary,
  openTransportCouponModal,
  redeemCouponCodeInModal,
} from "../lib/pages/transport-order-coupon.js";
import { buildTransportOrderToSummary } from "../lib/pages/transport-order.js";
import {
  bet4372Context,
  resetBet4372Context,
} from "../lib/test-data/bet-4372-context.js";
import { BET4372_VOUCHER_RULES } from "../lib/test-data/bet-4372.js";
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
  "a fixed-discount voucher for BET-4372 exists in the GGXB {string} admin panel",
  async ({ page }, region: string) => {
    test.setTimeout(180_000);
    resetBet4372Context();
    const input = await createFixedDiscountVoucherCode(
      page,
      parseRegion(region),
      BET4372_VOUCHER_RULES,
      {
        title: "BET-4372 waste AR coupon",
      },
    );
    bet4372Context.voucherCode = input.code;
    bet4372Context.voucherTitle = input.title;
  },
);

When(
  "I build a transport order with waste AR to summary for {string}",
  async ({ page }, region: string) => {
    const r = parseRegion(region);
    await navigateToTransportOrder(page, r);
    await buildTransportOrderToSummary(page, transportOrderFixture[r], {
      wasteRequirement: true,
    });
  },
);

When(
  "I build a transport order without waste AR to summary for {string}",
  async ({ page }, region: string) => {
    const r = parseRegion(region);
    await navigateToTransportOrder(page, r);
    await buildTransportOrderToSummary(page, transportOrderFixture[r], {
      wasteRequirement: false,
    });
  },
);

When("I open the transport order coupon modal", async ({ page }) => {
  await openTransportCouponModal(page);
});

When("I redeem the BET-4372 voucher code in the coupon modal", async ({ page }) => {
  if (!bet4372Context.voucherCode) {
    throw new Error("BET-4372 voucher code is not set — run the admin setup step first");
  }
  await redeemCouponCodeInModal(page, bet4372Context.voucherCode);
});

Then("the coupon redemption message should indicate success", async ({ page }) => {
  await expectCouponRedeemSuccessMessage(page);
});

Then(
  "the coupon redemption message should indicate the order is not eligible",
  async ({ page }) => {
    await expectCouponRedeemNotEligibleMessage(page);
  },
);

When("I apply the selected coupon in the transport order coupon modal", async ({ page }) => {
  await applySelectedCouponInModal(page);
});

Then(
  "the transport order summary should show the BET-4372 coupon applied",
  async ({ page }) => {
    if (!bet4372Context.voucherTitle) {
      throw new Error("BET-4372 voucher title is not set — run the admin setup step first");
    }
    await expectTransportCouponAppliedOnSummary(page, bet4372Context.voucherTitle);
  },
);
