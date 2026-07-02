export type VoucherCodeDateTime = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
};

export type VoucherAccountType = "personal" | "business";
export type VoucherServiceType = "transport" | "delivery";
export type VoucherVehicleType = "van" | "mudou" | "mudou9" | "motorcycle";
export type VoucherAdditionalRequirement =
  | "need_pet"
  | "loading_unloading_fee"
  | "need_waste"
  | "need_new_car";

/** Configurable voucher rules — discount amount is always fixed at 10. */
export type VoucherCodeRules = {
  accountTypes?: VoucherAccountType[];
  serviceTypes?: VoucherServiceType[];
  vehicleTypes?: VoucherVehicleType[];
  requiredAdditionalRequirements?: VoucherAdditionalRequirement[];
  firstOrderRule?: boolean;
  minOrderSpentRule?: number;
  infiniteRule?: boolean;
  waypointCheckRule?: "all" | "any";
};

export type VoucherCodeInput = {
  title: string;
  code: string;
  description?: string;
  status?: "active" | "inactive";
  accountTypes: VoucherAccountType[];
  serviceTypes: VoucherServiceType[];
  vehicleTypes: VoucherVehicleType[];
  firstOrderRule: boolean;
  minOrderSpentRule: number;
  infiniteRule: boolean;
  redeemStartAt: VoucherCodeDateTime;
  redeemExpiredAt: VoucherCodeDateTime;
  expirationDays?: string;
  maxQuantity?: string;
  organizationMaxQuantity: number;
  obtainedVoucherQuantityPerRedemption: number;
  discountType: "fixed_price";
  voucherAmount: number;
  maxDiscount: number;
  remark?: string;
  waypointCheckRule: "all" | "any";
  requiredAdditionalRequirements: VoucherAdditionalRequirement[];
};

export const VOUCHER_FIXED_DISCOUNT_AMOUNT = 10;

export function buildAutomationVoucherCode(prefix = "e2e"): string {
  return `${prefix}${Date.now().toString(36)}`;
}

export function currentMonthRedeemWindow(): {
  redeemStartAt: VoucherCodeDateTime;
  redeemExpiredAt: VoucherCodeDateTime;
} {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return {
    redeemStartAt: {
      year,
      month,
      day: "1",
      hour: "00",
      minute: "00",
    },
    redeemExpiredAt: {
      year,
      month,
      day: String(lastDay),
      hour: "23",
      minute: "59",
    },
  };
}

export type BuildVoucherCodeInputOptions = {
  title?: string;
  code?: string;
  description?: string;
  remark?: string;
  rules?: VoucherCodeRules;
  redeemStartAt?: VoucherCodeDateTime;
  redeemExpiredAt?: VoucherCodeDateTime;
  organizationMaxQuantity?: number;
  obtainedVoucherQuantityPerRedemption?: number;
};

export function buildVoucherCodeInput(
  options: BuildVoucherCodeInputOptions = {},
): VoucherCodeInput {
  const code = options.code ?? buildAutomationVoucherCode();
  const { redeemStartAt, redeemExpiredAt } = currentMonthRedeemWindow();
  const rules = options.rules ?? {};

  return {
    title: options.title ?? `E2E Voucher ${code}`,
    code,
    description: options.description,
    remark: options.remark,
    status: "active",
    accountTypes: rules.accountTypes ?? [],
    serviceTypes: rules.serviceTypes ?? [],
    vehicleTypes: rules.vehicleTypes ?? [],
    firstOrderRule: rules.firstOrderRule ?? false,
    minOrderSpentRule: rules.minOrderSpentRule ?? 0,
    infiniteRule: rules.infiniteRule ?? false,
    redeemStartAt: options.redeemStartAt ?? redeemStartAt,
    redeemExpiredAt: options.redeemExpiredAt ?? redeemExpiredAt,
    organizationMaxQuantity: options.organizationMaxQuantity ?? 0,
    obtainedVoucherQuantityPerRedemption:
      options.obtainedVoucherQuantityPerRedemption ?? 1,
    discountType: "fixed_price",
    voucherAmount: VOUCHER_FIXED_DISCOUNT_AMOUNT,
    maxDiscount: 0,
    waypointCheckRule: rules.waypointCheckRule ?? "all",
    requiredAdditionalRequirements:
      rules.requiredAdditionalRequirements ?? [],
  };
}
