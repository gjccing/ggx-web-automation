import { expect, type Page } from "@playwright/test";
import { ggxMovingBaseUrl } from "../../env.js";
import type { ContactFixture, WaypointFixture } from "../test-data/order-fixture.js";
import { fillWaypoint } from "./address-picker.js";
import { movingLabels } from "../labels.js";

/** Calendar-icon date picker used on std / disposal / corporate / overseas. */
export function moveDatePickerButton(page: Page) {
  // Scope to the field row (icon + popover), not a page-level flex that also
  // contains Back / address buttons.
  return page
    .getByAltText("calendar")
    .locator("xpath=ancestor::div[contains(@class,'gap-4')][1]")
    .getByRole("button")
    .first();
}

export async function expectMoveDateEmpty(page: Page): Promise<void> {
  const button = moveDatePickerButton(page);
  await expect(button).toBeVisible({ timeout: 15_000 });
  await expect(button).not.toHaveText(/\d{4}-\d{2}-\d{2}/);
}

export async function expectSelectDateError(page: Page): Promise<void> {
  await expect(page.getByText(movingLabels.selectDateError)).toBeVisible({
    timeout: 5_000,
  });
}

export async function clickEnquiryContinue(page: Page): Promise<void> {
  const next = page.getByRole("button", { name: movingLabels.next });
  if (await next.isVisible()) {
    await next.click();
    return;
  }
  await page.getByRole("button", { name: movingLabels.getQuote }).click();
}

export async function selectMoveDate(page: Page): Promise<void> {
  const button = moveDatePickerButton(page);
  if (/\d{4}-\d{2}-\d{2}/.test((await button.textContent()) ?? "")) {
    return;
  }

  await button.click();

  const target = new Date();
  target.setDate(target.getDate() + 1);
  const dayLabel = String(target.getDate());

  const calendar = page.locator(".rdp-root, [class*='rdp-']").first();
  await expect(calendar).toBeVisible({ timeout: 5_000 });

  const pickEnabledDay = () =>
    calendar
      .locator("button")
      .filter({ hasText: new RegExp(`^${dayLabel}$`) })
      .filter({ hasNot: page.locator(".\\!cursor-not-allowed") })
      .first();

  let dayButton = pickEnabledDay();
  if (!(await dayButton.isVisible().catch(() => false))) {
    await calendar.locator("button").filter({ has: page.getByAltText("Chevron Right") }).click();
    dayButton = pickEnabledDay();
  }

  await expect(dayButton).toBeVisible({ timeout: 5_000 });
  await dayButton.click();
  await expect(button).toHaveText(/\d{4}-\d{2}-\d{2}/);
}

export async function selectMoveTime(page: Page, timeLabel = "9:00 am"): Promise<void> {
  await page.getByRole("button", { name: movingLabels.time }).click();
  // Click the option button (data-value) — MenuItem wrapper clicks do not always fire onClick.
  await page.locator(`[data-value="${timeLabel}"]`).click();
  // Trigger accessible name includes the Chevron Down image alt after selection.
  await expect(
    page.getByRole("button", { name: new RegExp(`^${timeLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) }),
  ).toBeVisible();
  // MovingFormProvider debounces session persist by 300ms and cancels on unmount —
  // wait until the selected time is actually written before navigating away.
  await expect
    .poll(
      async () => {
        const raw = await page.evaluate(() => {
          for (const key of ["std-moving", "disposal-only"]) {
            const value = sessionStorage.getItem(key);
            if (!value) continue;
            try {
              const parsed = JSON.parse(value) as { time?: string };
              if (parsed.time) return parsed.time;
            } catch {
              /* ignore */
            }
          }
          return "";
        });
        return raw;
      },
      { timeout: 5_000 },
    )
    .toBe(timeLabel);
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
  await selectMoveDate(page);
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
  await expect(page.getByText(movingLabels.selectDateError)).toBeVisible();
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
