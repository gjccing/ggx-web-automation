import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Stabilize GGXB pages for visual smoke: kill animations, wait for fonts,
 * and wait until the route chrome has hydrated.
 */
export async function stabilizeForScreenshot(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      html {
        scroll-behavior: auto !important;
      }
    `,
  });

  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });

  await page.waitForLoadState("domcontentloaded");
  // Do not wait for networkidle — GGXB keeps long-polling / analytics sockets open.
  await waitForRouteContent(page);
}

async function waitForRouteContent(page: Page): Promise<void> {
  const path = new URL(page.url()).pathname;

  // Auth / public forms
  if (path.includes("/login")) {
    await expect(page.getByTestId("login-form")).toBeVisible({ timeout: 30_000 });
    return;
  }
  if (path.includes("/signup")) {
    await expect(page.locator("form, [data-testid]").first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("button", { name: /Create account|建立帳戶/i })).toBeVisible({
      timeout: 30_000,
    });
    return;
  }
  if (path.includes("/recovery")) {
    await expect(page.getByRole("button", { name: /Reset password|重設密碼/i })).toBeVisible({
      timeout: 30_000,
    });
    return;
  }

  // Authenticated shell — loading overlay can keep `body` visibility:hidden.
  const loadingDialog = page.getByRole("dialog").filter({ hasText: /Loading/i });
  if (await loadingDialog.isVisible().catch(() => false)) {
    await expect(loadingDialog).toBeHidden({ timeout: 30_000 });
  }

  const footerMenu = page.locator(
    '[data-testid="navigation-bar-footer-menu-user"]',
  );
  await expect(footerMenu).toBeVisible({ timeout: 30_000 });

  const main = page.getByTestId("main-content");
  if (await main.count()) {
    await expect(main).toBeVisible({ timeout: 30_000 });
  }

  // Page-specific ready signals (avoid capturing empty shells / mid-fetch lists).
  if (path.includes("/voucher")) {
    await expect(page.getByText(/Coupons|優惠券|Add a coupon|新增優惠券/i).first()).toBeVisible({
      timeout: 30_000,
    });
  }
  if (path.includes("/billing-history")) {
    await expect(
      page.getByText(/Transaction|Billing|交易|帳單/i).first(),
    ).toBeVisible({ timeout: 30_000 });
  }
  if (path.includes("/profile") && !path.includes("users")) {
    await expect(page.getByText(/Profile|個人資料|Change password|更改密碼/i).first()).toBeVisible({
      timeout: 30_000,
    });
  }
  if (path.includes("/address-book")) {
    await expect(page.getByText(/Address book|通訊錄|Add address|新增地址/i).first()).toBeVisible({
      timeout: 30_000,
    });
  }
  if (path.includes("/developer")) {
    await expect(
      page.getByText(/API|Application|Client secret|Webhook/i).first(),
    ).toBeVisible({ timeout: 30_000 });
  }

  // Transport order detail (`/orders/SI…`).
  if (/\/orders\/[A-Z]{2}\d+/.test(path)) {
    await expect(page.locator("h3").filter({ hasText: /Order #/ })).toBeVisible({
      timeout: 30_000,
    });
  }

  // Van place-order: Google Map tiles paint after the form shell.
  if (path.includes("/van/order")) {
    await expect(page.getByRole("region", { name: "Map" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(".gm-style").first()).toBeVisible({
      timeout: 30_000,
    });
    // Waypoint trash icons only appear on hover — clear hover before capture.
    await page.mouse.move(0, 0);
  }

  // Dismiss one-time bulk-import modal if it appears.
  if (path.includes("/delivery/bulk-import")) {
    const modal = page.getByRole("dialog");
    if (await modal.isVisible().catch(() => false)) {
      await page.keyboard.press("Escape");
      await expect(modal).toBeHidden({ timeout: 10_000 }).catch(() => undefined);
    }
  }

  // Settle dynamic lists / wallet widgets briefly.
  await page.waitForTimeout(1_500);
}

export async function defaultVisualMasks(page: Page): Promise<Locator[]> {
  const path = new URL(page.url()).pathname;
  const masks: Locator[] = [
    // Sidebar wallet balance changes often.
    page.locator('[data-cy="topup-amount"]'),
    // Notification unread badges / drawer counts.
    page.locator('[data-testid="notification-center"]'),
    page.locator('[aria-label*="notification" i], [aria-label*="Notification" i]'),
    // Date pickers / relative timestamps in tables.
    page.locator("button").filter({
      hasText:
        /^\d{4}-\d{2}-\d{2}$|\d{1,2}\/\d{1,2}\/\d{2,4}|^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i,
    }),
    page.getByText(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b.*\d{1,2}/i),
  ];

  // Payment method overview: Credit / Free credit amounts drift with top-ups.
  if (path.includes("/payment-method")) {
    masks.push(
      page
        .getByText(/^Credit$/i)
        .locator("xpath=following::*[starts-with(normalize-space(.),'$')][1]"),
    );
    masks.push(
      page
        .getByText(/^Free credit$/i)
        .locator("xpath=following::*[starts-with(normalize-space(.),'$')][1]"),
    );
  }

  // Van place-order wizard: map tiles + live pick-up clock + quote totals drift.
  if (path.includes("/van/order")) {
    // Prefer the whole map panel so empty vs tiled states compare equal.
    masks.push(
      page.getByRole("region", { name: "Map" }).locator("xpath=.."),
    );
    masks.push(page.locator(".gm-style").first());
    // Hour / minute defaults follow "now".
    masks.push(
      page
        .getByRole("heading", { name: /^Pick-up time$/i })
        .locator("xpath=following-sibling::*[1]"),
    );
    // Trash affordance on From/To appears only while hovered.
    masks.push(
      page.locator('button[aria-label*="delete" i], button[aria-label*="remove" i], [data-testid*="delete" i], [data-testid*="remove" i]'),
    );
    masks.push(page.getByText(/^\$[\d,]+(?:\.\d{2})?$/));
  }

  // Transport order detail page (`/orders/SI…`).
  if (/\/orders\/[A-Z]{2}\d+/.test(path)) {
    masks.push(page.locator("h3").filter({ hasText: /Order #/ }));
    masks.push(page.getByText(/^\$[\d,]+(?:\.\d{2})?$/));
    masks.push(page.locator(".gm-style").first());
    masks.push(page.getByTestId("status-text"));
  }

  // Delivery order detail drawer (same list URL) — only when detail is open.
  if (path.includes("/delivery/order-management")) {
    const orderIdHeading = page.getByRole("heading", { name: /Order ID/i });
    if (await orderIdHeading.isVisible().catch(() => false)) {
      masks.push(orderIdHeading);
      masks.push(page.getByText(/^\$[\d,]+(?:\.\d{2})?$/));
      masks.push(page.getByTestId("order-detail-drawer").getByText(/\d{6}/));
    }
  }

  return masks;
}

export async function expectUiSnapshot(
  page: Page,
  name: string,
  options?: {
    fullPage?: boolean;
    mask?: Locator[];
    maxDiffPixelRatio?: number;
  },
): Promise<void> {
  await stabilizeForScreenshot(page);

  const mask = [
    ...(await defaultVisualMasks(page)),
    ...(options?.mask ?? []),
  ];

  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: options?.fullPage ?? true,
    animations: "disabled",
    maxDiffPixelRatio: options?.maxDiffPixelRatio ?? 0.03,
    mask,
  });
}
