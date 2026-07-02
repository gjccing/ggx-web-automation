import type { VoucherCodeRules } from "./admin/voucher-code.js";

export const BET4372_VOUCHER_RULES: VoucherCodeRules = {
  accountTypes: ["business"],
  serviceTypes: ["transport"],
  vehicleTypes: ["van"],
  requiredAdditionalRequirements: ["need_waste"],
};

export const couponRedeemSuccessMessage =
  /Coupon claimed and saved to your account/i;

export const couponRedeemNotEligibleMessage =
  /not eligible to use this coupon/i;

export const transportWasteRequirementLabel =
  /Transport or dispose waste/i;
