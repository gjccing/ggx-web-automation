import { createBdd } from "playwright-bdd";
import { test } from "@playwright/test";
import { createFixedDiscountVoucherCode } from "../lib/admin/pages/voucher-code.js";
import { navigateToTransportOrder } from "../lib/navigation/side-menu.js";
import {
  expectCouponAppliedSuccessToast,
  expectTransportCouponAppliedOnSummary,
  openTransportCouponModalViaTopEntry,
  redeemCouponCodeInModal,
} from "../lib/pages/transport-order-coupon.js";
import { buildTransportOrderToSummary } from "../lib/pages/transport-order.js";
import {
  bet4403Context,
  resetBet4403Context,
} from "../lib/test-data/bet-4403-context.js";
import { BET4403_VOUCHER_RULES } from "../lib/test-data/bet-4403.js";
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
  "a fixed-discount voucher for BET-4403 exists in the GGXB {string} admin panel",
  async ({ page }, region: string) => {
    test.setTimeout(180_000);
    resetBet4403Context();
    const input = await createFixedDiscountVoucherCode(
      page,
      parseRegion(region),
      BET4403_VOUCHER_RULES,
      {
        title: "BET-4403 top coupon entry toast",
      },
    );
    bet4403Context.voucherCode = input.code;
    bet4403Context.voucherTitle = input.title;
  },
);

When(
  "I build a transport order to summary for {string}",
  async ({ page }, region: string) => {
    const r = parseRegion(region);
    await navigateToTransportOrder(page, r);
    await buildTransportOrderToSummary(page, transportOrderFixture[r], {
      wasteRequirement: false,
    });
  },
);

When(
  "I open the transport order coupon modal via the top Coupon entry",
  async ({ page }) => {
    await openTransportCouponModalViaTopEntry(page);
  },
);

When("I redeem the BET-4403 voucher code in the coupon modal", async ({ page }) => {
  if (!bet4403Context.voucherCode) {
    throw new Error("BET-4403 voucher code is not set — run the admin setup step first");
  }
  await redeemCouponCodeInModal(page, bet4403Context.voucherCode);
});

Then("the coupon applied success toast should be shown", async ({ page }) => {
  await expectCouponAppliedSuccessToast(page);
});

Then(
  "the transport order summary should show the BET-4403 coupon applied",
  async ({ page }) => {
    if (!bet4403Context.voucherTitle) {
      throw new Error("BET-4403 voucher title is not set — run the admin setup step first");
    }
    await expectTransportCouponAppliedOnSummary(page, bet4403Context.voucherTitle);
  },
);
