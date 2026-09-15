import type { VoucherCodeRules } from "./admin/voucher-code.js";
import { couponAppliedSuccessToast } from "./bet-4403.js";

/** Plain transport coupon — consumed on the first placed order. */
export const BET4451_VOUCHER_RULES: VoucherCodeRules = {
  accountTypes: ["business"],
  serviceTypes: ["transport"],
  vehicleTypes: ["van"],
};

/**
 * `feedback__coupon_applied` — EN + ZH.
 * ZH copy is "已使用優惠券，可享{{discount}}優惠" (the Jira "Already used" wording).
 */
export const couponAppliedFeedbackToast = new RegExp(
  `${couponAppliedSuccessToast.source}|已使用優惠券，可享`,
  "i",
);
