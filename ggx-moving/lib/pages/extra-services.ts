import { expect, type Page } from "@playwright/test";
import type { GgxMovingLocale } from "../../env.js";
import {
  bet4343PackingDescriptionField,
  bet4343PackingOptionLabel,
} from "../test-data/bet-4343.js";
import {
  clickHomepageCta,
  openHomepage,
  selectService,
} from "./homepage.js";
import {
  clickWizardNext,
  fillMoveDetailsStep,
} from "./wizard.js";
import {
  stdMovingWaypoints,
} from "../test-data/order-fixture.js";

function packingServiceRow(page: Page, locale: GgxMovingLocale) {
  return page
    .locator("div.flex.h-14.items-center.gap-4")
    .filter({ has: page.getByText(bet4343PackingOptionLabel[locale], { exact: true }) });
}

export async function openStandardMovingExtraServices(
  page: Page,
  locale: GgxMovingLocale = "en-HK",
): Promise<void> {
  await openHomepage(page, locale);
  await selectService(page, "standard");
  await clickHomepageCta(page);
  await expect(page).toHaveURL(/std-moving\/move-details/);
  await fillMoveDetailsStep(
    page,
    stdMovingWaypoints.from,
    stdMovingWaypoints.to,
  );
  await clickWizardNext(page);
  await expect(page).toHaveURL(/items-to-move/);
  await clickWizardNext(page);
  await expect(page).toHaveURL(/extra-services/);
}

export async function selectPackingIntoCartons(
  page: Page,
  locale: GgxMovingLocale = "en-HK",
): Promise<void> {
  const row = packingServiceRow(page, locale);
  await expect(row).toBeVisible();
  await row.getByRole("checkbox").click();
  await expect(row.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
}

export async function expectPackingServiceOptionVisible(
  page: Page,
  locale: GgxMovingLocale = "en-HK",
): Promise<void> {
  await expect(
    page.getByText(bet4343PackingOptionLabel[locale], { exact: true }),
  ).toBeVisible();
}

export async function expectNoPackingDescriptionField(
  page: Page,
  locale: GgxMovingLocale = "en-HK",
): Promise<void> {
  await expect(
    page.getByRole("textbox", { name: bet4343PackingDescriptionField[locale] }),
  ).not.toBeVisible();
}
