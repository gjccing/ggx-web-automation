import { createBdd } from "playwright-bdd";
import { createFixedDiscountVoucherCode } from "../../../lib/admin/pages/voucher-code.js";
import {
  type VoucherAccountType,
  type VoucherAdditionalRequirement,
  type VoucherServiceType,
  type VoucherVehicleType,
} from "../../../lib/test-data/admin/voucher-code.js";
import { type GgxbRegion } from "../../../env.js";

const { When } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

function parseList(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseVoucherRules(table: Record<string, string>) {
  return {
    accountTypes: parseList(table["account types"]) as VoucherAccountType[],
    serviceTypes: parseList(table["service types"]) as VoucherServiceType[],
    vehicleTypes: parseList(table["vehicle types"]) as VoucherVehicleType[],
    requiredAdditionalRequirements: parseList(
      table["required additional requirements"],
    ) as VoucherAdditionalRequirement[],
    firstOrderRule: table["first order rule"] === "true",
    minOrderSpentRule: Number(table["min order spent rule"] ?? 0),
    infiniteRule: table["infinite rule"] === "true",
    waypointCheckRule:
      table["waypoint check rule"] === "any" ? ("any" as const) : ("all" as const),
  };
}

When(
  "I create a fixed-discount voucher code in the GGXB {string} admin panel",
  async ({ page }, region: string) => {
    await createFixedDiscountVoucherCode(page, parseRegion(region), {}, {
      login: false,
    });
  },
);

When(
  "I create a fixed-discount voucher code in the GGXB {string} admin panel with:",
  async ({ page }, region: string, table: Record<string, string>) => {
    await createFixedDiscountVoucherCode(
      page,
      parseRegion(region),
      parseVoucherRules(table),
      { login: false },
    );
  },
);
