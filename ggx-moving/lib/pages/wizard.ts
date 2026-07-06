import { expect, type Page } from "@playwright/test";
import { ggxMovingBaseUrl } from "../../env.js";
import type { ContactFixture, WaypointFixture } from "../test-data/order-fixture.js";
import { fillWaypoint } from "./address-picker.js";
import { movingLabels } from "../labels.js";

export async function selectMoveTime(page: Page, timeLabel = "9:00 am"): Promise<void> {
  await page.getByRole("button", { name: movingLabels.time }).click();
  await page.getByRole("menuitem", { name: timeLabel }).click();
}

export async function fillMoveDetailsStep(
  page: Page,
  from: WaypointFixture,
  to?: WaypointFixture,
): Promise<void> {
  await fillWaypoint(page, movingLabels.from, from);
  if (to) {
    await fillWaypoint(page, movingLabels.to, to);
  }
  await selectMoveTime(page);
}

export async function clickWizardNext(page: Page): Promise<void> {
  const next = page.getByRole("button", { name: movingLabels.next });
  await next.waitFor({ state: "visible" });
  await next.click();
}

export async function expectMoveDetailsValidationErrors(page: Page): Promise<void> {
  await expect(page.getByText(/enter an address|輸入.*地址/i).first()).toBeVisible({
    timeout: 5_000,
  });
  await expect(page.getByText(/select.*time|選擇.*時間/i)).toBeVisible();
}

export async function proceedThroughItemsAndExtras(page: Page): Promise<void> {
  await expect(page).toHaveURL(/items-to-move/);
  await clickWizardNext(page);
  await expect(page).toHaveURL(/extra-services/);
  await clickWizardNext(page);
  await expect(page).toHaveURL(/final-details/);
}

export async function fillFinalDetailsAndSubmit(
  page: Page,
  contact: ContactFixture,
): Promise<string> {
  const orderResponse = page.waitForResponse(
    (res) =>
      res.url().includes("/api/order/new/") &&
      res.request().method() === "POST" &&
      res.ok(),
  );

  await page.getByRole("textbox", { name: movingLabels.preferredName }).fill(contact.name);
  await page.getByRole("textbox", { name: movingLabels.phoneNumber }).fill(contact.phone);
  await page.getByRole("textbox", { name: movingLabels.emailOptional }).fill(contact.email);

  await page.getByRole("button", { name: movingLabels.submit }).click();

  const newOrder = await orderResponse;
  const { orderId } = (await newOrder.json()) as { orderId: string };

  await page.getByRole("button", { name: movingLabels.submit }).waitFor({ state: "hidden", timeout: 30_000 }).catch(() => {});
  await expect(page).toHaveURL(/submitted/, { timeout: 60_000 });
  await expect(
    page.getByText(movingLabels.requestSubmitted),
  ).toBeVisible({ timeout: 15_000 });

  return orderId;
}

export async function fillSinglePageContactAndSubmit(
  page: Page,
  contact: ContactFixture,
  submitLabel: RegExp = movingLabels.getQuote,
): Promise<string> {
  const orderResponse = page.waitForResponse(
    (res) =>
      res.url().includes("/api/order/new/") &&
      res.request().method() === "POST" &&
      res.ok(),
  );

  await page.getByRole("textbox", { name: movingLabels.preferredName }).fill(contact.name);
  await page.getByRole("textbox", { name: movingLabels.phoneNumber }).fill(contact.phone);
  await page.getByRole("textbox", { name: movingLabels.email }).fill(contact.email);
  await page.getByRole("button", { name: submitLabel }).click();

  const newOrder = await orderResponse;
  const { orderId } = (await newOrder.json()) as { orderId: string };

  await expect(page).toHaveURL(/submitted/, { timeout: 30_000 });
  return orderId;
}

export async function expectWizardStepGuardRedirect(
  page: Page,
  service: "std-moving" | "disposal-only",
  step: string,
): Promise<void> {
  const firstStep = service === "std-moving" ? "move-details" : "disposal-details";
  await page.goto(`${ggxMovingBaseUrl()}/${service}/${step}`);
  await expect(page).toHaveURL(new RegExp(`/${service}/${firstStep}`));
}
