import { expect, type Page } from "@playwright/test";
import { ggxbAdminBaseUrl, type GgxbRegion } from "../../../env.js";
import { loginAdminViaUi } from "../auth.js";
import {
  buildVoucherCodeInput,
  type BuildVoucherCodeInputOptions,
  type VoucherCodeDateTime,
  type VoucherCodeInput,
  type VoucherCodeRules,
} from "../../test-data/admin/voucher-code.js";

type CheckboxOption = { id: string; label: string };

const CHECKBOX_GROUPS: Record<
  string,
  { legend: RegExp; options: CheckboxOption[] }
> = {
  account_types: {
    legend: /Account types/i,
    options: [
      { id: "personal", label: "personal" },
      { id: "business", label: "business" },
    ],
  },
  service_types_rule: {
    legend: /Service types rule/i,
    options: [
      { id: "transport", label: "transport" },
      { id: "delivery", label: "delivery" },
    ],
  },
  vehicle_types_rule: {
    legend: /Vehicle types rule/i,
    options: [
      { id: "van", label: "van" },
      { id: "mudou", label: "mudou" },
      { id: "mudou9", label: "mudou9" },
      { id: "motorcycle", label: "motorcycle" },
    ],
  },
  required_additional_requirements_rule: {
    legend: /Required Additional Requirements/i,
    options: [
      { id: "need_pet", label: "Pet-friendly driver" },
      { id: "loading_unloading_fee", label: "Move door-to-door" },
      { id: "need_waste", label: "Transport or dispose waste" },
      { id: "need_new_car", label: "Premium Van" },
    ],
  },
};

async function setCheckboxGroup(
  page: Page,
  field: string,
  selected: string[],
): Promise<void> {
  const group = CHECKBOX_GROUPS[field];

  await page.evaluate(
    ({ fieldName, selectedIds, options }) => {
      for (const option of options) {
        const shouldCheck = selectedIds.includes(option.id);
        const input = document.querySelector<HTMLInputElement>(
          `#voucher_code_${fieldName}_${option.id}`,
        );
        if (!input) {
          continue;
        }

        input.checked = shouldCheck;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    },
    { fieldName: field, selectedIds: selected, options: group.options },
  );
}

function voucherCodesPath(region: GgxbRegion, suffix = ""): string {
  const base = ggxbAdminBaseUrl(region).replace(/\/$/, "");
  return `${base}/voucher_codes${suffix}`;
}

export async function openVoucherCodesIndex(
  page: Page,
  region: GgxbRegion,
): Promise<void> {
  const url = voucherCodesPath(region);
  const response = await page.goto(url);
  expect(response, "voucher codes navigation should return a response").not.toBeNull();
  expect(response!.ok(), `expected HTTP 2xx for ${url}`).toBeTruthy();
  await expect(page).toHaveURL(/\/admin\/voucher_codes(?:\?|#|$)/);
  await expect(page).toHaveTitle(/Voucher Codes.*Admin Panel/i);
}

export async function openNewVoucherCodeForm(
  page: Page,
  region: GgxbRegion,
): Promise<void> {
  const url = voucherCodesPath(region, "/new");
  const response = await page.goto(url);
  expect(response, "new voucher navigation should return a response").not.toBeNull();
  expect(response!.ok(), `expected HTTP 2xx for ${url}`).toBeTruthy();
  await expect(page).toHaveURL(/\/admin\/voucher_codes\/new(?:\?|#|$)/);
  await expect(page).toHaveTitle(/New Voucher Code.*Admin Panel/i);
}

async function setDateTimeSelects(
  page: Page,
  field: string,
  value: VoucherCodeDateTime,
): Promise<void> {
  await page.locator(`#voucher_code_${field}_1i`).selectOption(value.year);
  await page.locator(`#voucher_code_${field}_2i`).selectOption(value.month);
  await page.locator(`#voucher_code_${field}_3i`).selectOption(value.day);
  await page.locator(`#voucher_code_${field}_4i`).selectOption(value.hour);
  await page.locator(`#voucher_code_${field}_5i`).selectOption(value.minute);
}

export async function fillVoucherCodeForm(
  page: Page,
  input: VoucherCodeInput,
): Promise<void> {
  await page.locator("#voucher_code_title").fill(input.title);

  if (input.description) {
    await page.locator("#voucher_code_description").fill(input.description);
  }

  await page.locator("#voucher_code_code").fill(input.code);

  if (input.status) {
    await page.locator("#voucher_code_status").selectOption(input.status);
  }

  await page
    .locator("#voucher_code_first_order_rule")
    .selectOption(String(input.firstOrderRule));
  await page
    .locator("#voucher_code_min_order_spent_rule")
    .fill(String(input.minOrderSpentRule));
  await page
    .locator("#voucher_code_infinite_rule")
    .selectOption(String(input.infiniteRule));

  await setDateTimeSelects(page, "redeem_start_at", input.redeemStartAt);
  await setDateTimeSelects(page, "redeem_expired_at", input.redeemExpiredAt);

  if (input.expirationDays) {
    await page
      .locator("#voucher_code_expiration_days")
      .fill(input.expirationDays);
  }

  if (input.maxQuantity) {
    await page.locator("#voucher_code_max_quantity").fill(input.maxQuantity);
  }

  await page
    .locator("#voucher_code_organization_max_quantity")
    .fill(String(input.organizationMaxQuantity));
  await page
    .locator("#voucher_code_obtained_voucher_quantity_per_redemption")
    .fill(String(input.obtainedVoucherQuantityPerRedemption));

  await page
    .locator("#voucher_code_discount_type")
    .selectOption(input.discountType);
  await page
    .locator("#voucher_code_voucher_amount")
    .fill(String(input.voucherAmount));
  await page
    .locator("#voucher_code_max_discount")
    .fill(String(input.maxDiscount));

  if (input.remark) {
    await page.locator("#voucher_code_remark").fill(input.remark);
  }

  await page
    .locator("#voucher_code_waypoint_check_rule")
    .selectOption(input.waypointCheckRule);

  await setCheckboxGroup(page, "account_types", input.accountTypes);
  await setCheckboxGroup(page, "service_types_rule", input.serviceTypes);
  await setCheckboxGroup(page, "vehicle_types_rule", input.vehicleTypes);
  await setCheckboxGroup(
    page,
    "required_additional_requirements_rule",
    input.requiredAdditionalRequirements,
  );
}

export async function submitNewVoucherCodeForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Create Voucher code" }).click();
}

export async function expectVoucherCodeCreated(
  page: Page,
  title: string,
): Promise<void> {
  await expect(page).toHaveURL(/\/admin\/voucher_codes\/\d+(?:\?|#|$)/, {
    timeout: 30_000,
  });
  await expect(page).toHaveTitle(new RegExp(title, "i"));
}

export type CreateVoucherCodeOptions = {
  login?: boolean;
};

export async function createFixedDiscountVoucherCode(
  page: Page,
  region: GgxbRegion,
  rules: VoucherCodeRules = {},
  options: CreateVoucherCodeOptions & BuildVoucherCodeInputOptions = {},
): Promise<VoucherCodeInput> {
  const { login, ...inputOptions } = options;
  const input = buildVoucherCodeInput({ ...inputOptions, rules });
  await createVoucherCode(page, region, input, { login });
  return input;
}

export async function createVoucherCode(
  page: Page,
  region: GgxbRegion,
  input: VoucherCodeInput,
  options: CreateVoucherCodeOptions = {},
): Promise<void> {
  if (options.login !== false) {
    await loginAdminViaUi(page, region);
  }

  await openNewVoucherCodeForm(page, region);
  await fillVoucherCodeForm(page, input);
  await submitNewVoucherCodeForm(page);
  await expectVoucherCodeCreated(page, input.title);
}
