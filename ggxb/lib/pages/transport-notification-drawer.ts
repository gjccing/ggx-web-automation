import { expect, type Page } from "@playwright/test";
import { ggxbBaseUrl } from "../../env.js";
import { ensureEnglish } from "../navigation/side-menu.js";
import { dismissNotifications } from "./notifications.js";
import { transportOrderLabels } from "./transport-order.js";
import { bet4485Context } from "../test-data/bet-4485-context.js";

function trackOrderRequests(page: Page): void {
  page.on("response", (response) => {
    if (response.request().method() !== "GET") return;
    const url = response.url().split("?")[0];
    if (url.endsWith("/b2b/order_requests/index")) {
      bet4485Context.listUrls.push(url);
      return;
    }
    if (/\/b2b\/order_requests\/[^/]+$/.test(url)) {
      bet4485Context.detailUrls.push(url);
    }
  });
}

export async function openTransportOrderManagementTab(page: Page): Promise<void> {
  const orders = await page.context().newPage();
  trackOrderRequests(orders);
  const base = ggxbBaseUrl("hk").replace(/\/$/, "");
  await orders.goto(`${base}/orders`, { waitUntil: "domcontentloaded" });
  await orders.getByTestId("main-content").waitFor({ state: "visible", timeout: 30_000 });
  await ensureEnglish(orders);
  await dismissNotifications(orders);
  await expect(orders.getByText(/Order has been created/i)).toHaveCount(0);
  bet4485Context.ordersPage = orders;
}

async function closeOpenListbox(page: Page): Promise<void> {
  await page.keyboard.press("Escape");
  await page
    .locator('[role="listbox"]')
    .first()
    .waitFor({ state: "hidden", timeout: 3_000 })
    .catch(() => {});
}

async function pickSavedAddress(
  page: Page,
  waypoint: "from" | "to",
  optionIndex: number,
): Promise<void> {
  await closeOpenListbox(page);
  const input = page.getByPlaceholder(/Address|地址/).nth(waypoint === "from" ? 0 : 1);
  await input.scrollIntoViewIfNeeded();
  await input.click({ force: true });
  const options = page
    .getByTestId("autocomplete-option")
    .filter({ has: page.getByTestId("contact-icon") });
  await expect(options.nth(optionIndex)).toBeVisible({ timeout: 15_000 });
  await options.nth(optionIndex).click();
  await closeOpenListbox(page);
}

async function dismissTunnelPreference(page: Page): Promise<void> {
  const heading = page.getByRole("heading", { name: /Add tunnel preference/i });
  try {
    await heading.waitFor({ state: "visible", timeout: 8_000 });
  } catch {
    return;
  }
  const tunnelOption = page.getByText(/Eastern Harbour Crossing|東區海底隧道/i).first();
  if (await tunnelOption.isVisible().catch(() => false)) {
    await tunnelOption.click();
  } else {
    await page.getByText(/^No preference$/i).first().click();
  }
  await page.getByRole("button", { name: transportOrderLabels.confirmButton }).click();
  await heading.waitFor({ state: "hidden", timeout: 15_000 });
}

async function payWithSavedCardIfNeeded(page: Page): Promise<void> {
  const placeBtn = page.getByRole("button", { name: transportOrderLabels.placeOrderButton });
  if (await placeBtn.isEnabled()) return;

  await page.getByText(/^Wallet$/).first().click();
  const modal = page.getByTestId("pay-with-modal-wrapper");
  await expect(modal).toBeVisible({ timeout: 15_000 });
  const card = modal.getByText(/⋅⋅⋅⋅/).first();
  await expect(card, "a saved card is required when the wallet cannot cover the order").toBeVisible();
  await card.click();
  const ok = modal.getByRole("button", { name: /^(OK|Confirm)$/ });
  if (await ok.isVisible().catch(() => false)) {
    await ok.click();
  }
  await expect(placeBtn).toBeEnabled({ timeout: 15_000 });
}

/** Place a van order using two saved address-book entries. Returns the order id. */
export async function placeTransportOrderFromAddressBook(page: Page): Promise<string> {
  const base = ggxbBaseUrl("hk").replace(/\/$/, "");
  await page.goto(`${base}/van/order`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("main-content").waitFor({ state: "visible", timeout: 30_000 });
  await pickSavedAddress(page, "from", 0);
  await pickSavedAddress(page, "to", 1);

  const phone = page.getByPlaceholder(/Phone number|電話號碼/).first();
  if ((await phone.inputValue().catch(() => "")) === "") {
    await phone.click({ force: true });
    await phone.fill("22222222");
    await closeOpenListbox(page);
  }

  await page.getByRole("button", { name: transportOrderLabels.nextButton }).click();
  await page
    .getByRole("button", { name: transportOrderLabels.reviewOrderButton })
    .click({ timeout: 20_000 });
  await dismissTunnelPreference(page);

  const placeBtn = page.getByRole("button", { name: transportOrderLabels.placeOrderButton });
  if (!(await placeBtn.isVisible().catch(() => false))) {
    await page.getByRole("button", { name: transportOrderLabels.reviewOrderButton }).click();
    await dismissTunnelPreference(page);
  }
  await expect(placeBtn).toBeVisible({ timeout: 20_000 });
  await payWithSavedCardIfNeeded(page);
  await placeBtn.click();
  await expect(page.getByText(/Order placed/i)).toBeVisible({ timeout: 40_000 });

  const header = (await page.locator("h3").filter({ hasText: /Order #/ }).textContent()) ?? "";
  const match = header.match(/#([A-Z]{2}\d{7})/);
  if (!match) {
    throw new Error(`Could not read the placed transport order id from "${header}"`);
  }
  return match[1];
}

export function ordersPage(): Page {
  const orders = bet4485Context.ordersPage;
  if (!orders) throw new Error("Transport order management tab is not open");
  return orders;
}

export async function openCreatedOrderAndAskToCancel(orderId: string): Promise<void> {
  const orders = ordersPage();
  await expect(orders.getByText(/Order has been created/i).first()).toBeVisible({
    timeout: 40_000,
  });
  await expect(orders.getByText(`#${orderId}`).first()).toBeVisible();

  const search = orders.getByPlaceholder(/Name, phone number, address, order/i);
  await search.fill(orderId);
  await orders.getByRole("button", { name: /^Search$/ }).click();

  const row = orders.locator("tr").filter({ hasText: `#${orderId}` }).first();
  await expect(row).toBeVisible({ timeout: 20_000 });
  await row.getByText(`#${orderId}`).click();

  await expect(orders.getByText("Cancel order", { exact: true }).first()).toBeVisible({
    timeout: 30_000,
  });
  await expect(orders.getByText(/Order has been created/i).first()).toBeVisible();
  await orders.getByText("Cancel order", { exact: true }).first().click();
  await expect(orders.getByText(/Cancel order\?/i).first()).toBeVisible({ timeout: 15_000 });

  bet4485Context.detailCountAtConfirm = bet4485Context.detailUrls.length;
  bet4485Context.listCountAtConfirm = bet4485Context.listUrls.length;
}

export async function expectCancelConfirmationStays(orderA: string, orderC: string): Promise<void> {
  const orders = ordersPage();
  await expect(orders.getByText(`#${orderC}`).first()).toBeVisible({ timeout: 40_000 });
  await orders.waitForTimeout(3_000);

  await expect(
    orders.getByText(/Cancel order\?/i).first(),
    "a notification for a different order must not close Cancel order?",
  ).toBeVisible();
  await expect(orders.getByText(/Order has been created/i)).toHaveCount(2);
  await expect(orders.locator("h3").filter({ hasText: `Order #${orderA}` })).toBeVisible();
}

export function expectOpenOrderNotRefetched(): void {
  expect(
    bet4485Context.detailUrls.length,
    "the open order's detail must not be fetched again",
  ).toBe(bet4485Context.detailCountAtConfirm);
}

export function expectOrderListNotRefetched(): void {
  expect(
    bet4485Context.listUrls.length,
    "the order list must not refetch when the new notification's order is not on the current page",
  ).toBe(bet4485Context.listCountAtConfirm);
}
