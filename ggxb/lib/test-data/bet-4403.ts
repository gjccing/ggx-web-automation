import type { VoucherCodeRules } from "./admin/voucher-code.js";

/** Plain transport coupon — no required additional services. */
export const BET4403_VOUCHER_RULES: VoucherCodeRules = {
  accountTypes: ["business"],
  serviceTypes: ["transport"],
  vehicleTypes: ["van"],
};

/** Toast shown after applying a coupon on Place Order Summary. */
export const couponAppliedSuccessToast =
  /Coupon applied\.\s*Enjoy \$\d+(?:\.\d+)? off!/i;
