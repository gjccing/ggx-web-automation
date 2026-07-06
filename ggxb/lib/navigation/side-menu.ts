import { expect, type Page } from "@playwright/test";
import { ggxbBaseUrl, type GgxbRegion } from "../../env.js";

/** Post-login guard — API locale can flip UI back to ZH after sign-in page EN toggle. */
export async function ensureEnglish(page: Page): Promise<void> {
  const footerMenu = page.locator(
    '[data-testid="navigation-bar-footer-menu-user"]',
  );
  await expect(footerMenu).toBeVisible({ timeout: 15_000 });

  const homeEn = page.getByRole("link", { name: "Home" });
  if (await homeEn.isVisible().catch(() => false)) {
    return;
  }

  await footerMenu.click();
  const languageSwitch = page.locator('[data-testid="language-switch"]');
  await expect(languageSwitch).toBeVisible();
  const label = (await languageSwitch.textContent())?.trim() ?? "";
  if (label === "English") {
    await languageSwitch.click();
    await expect(homeEn).toBeVisible({ timeout: 15_000 });
  }
}

/** Switch HK UI to Traditional Chinese when English is active. */
export async function ensureTraditionalChinese(page: Page): Promise<void> {
  const footerMenu = page.locator(
    '[data-testid="navigation-bar-footer-menu-user"]',
  );
  await expect(footerMenu).toBeVisible({ timeout: 15_000 });

  const homeZh = page.getByRole("link", { name: /主頁|首頁/ });
  if (await homeZh.isVisible().catch(() => false)) {
    return;
  }

  await footerMenu.click();
  const languageSwitch = page.locator('[data-testid="language-switch"]');
  await expect(languageSwitch).toBeVisible();
  const label = (await languageSwitch.textContent())?.trim() ?? "";
  if (label === "繁體中文") {
    await languageSwitch.click();
    await expect(homeZh).toBeVisible({ timeout: 15_000 });
  }
}

export async function navigateToTransportOrder(
  page: Page,
  region: GgxbRegion,
  options?: { locale?: "en" | "zh" },
): Promise<void> {
  if (region === "hk") {
    if (options?.locale === "zh") {
      await ensureTraditionalChinese(page);
    } else {
      await ensureEnglish(page);
    }
  }

  const base = ggxbBaseUrl(region).replace(/\/$/, "");
  const onOrderPage = page.url().includes("/van/order");
  if (!onOrderPage) {
    const link = page
      .locator('a[href*="/van/order"]')
      .filter({ hasText: /Place order|Place an order|新增訂單/i })
      .first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
    } else {
      await page.goto(`${base}/van/order`);
    }
  }

  await expect(page).toHaveURL(/\/van\/order(?:\/|$|\?|#)/, { timeout: 30_000 });
  await expect(page.getByTestId("main-content")).toBeVisible({ timeout: 30_000 });
}

export async function navigateToDeliveryOrder(
  page: Page,
  region: GgxbRegion,
): Promise<void> {
  if (region === "hk") {
    await ensureEnglish(page);
  }

  const base = ggxbBaseUrl(region).replace(/\/$/, "");
  const onOrderPage = page.url().includes("/delivery/order");
  if (!onOrderPage) {
    const link = page
      .locator('a[href*="/delivery/order"]')
      .filter({ hasText: /Place order|Place an order/i })
      .first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
    } else {
      await page.goto(`${base}/delivery/order`);
    }
  }

  await expect(page).toHaveURL(/\/delivery\/order(?:\/|$|\?|#)/, {
    timeout: 30_000,
  });
  await expect(page.getByTestId("main-content")).toBeVisible({ timeout: 30_000 });
}

export function parseWalletBalanceText(text: string): number {
  const normalized = text.replace(/,/g, "");
  const match = normalized.match(/\$([\d.]+)/);
  if (!match) {
    throw new Error(`Could not parse wallet balance from: ${text}`);
  }
  return Math.round(Number(match[1]));
}

export async function readSidebarWalletBalance(page: Page): Promise<number> {
  const balance = page.locator('[data-cy="topup-amount"]');
  await expect(balance).toBeVisible({ timeout: 15_000 });
  return parseWalletBalanceText((await balance.textContent()) ?? "");
}

export async function closeTopUpModal(page: Page): Promise<void> {
  const closeBtn = page.locator('[data-cy="modal-close-btn"]');
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    await expect(page.getByTestId("top-up-modal-wrapper")).toBeHidden({
      timeout: 15_000,
    });
  }
}

export async function openTopUpModal(page: Page): Promise<void> {
  await closeTopUpModal(page);
  if (await page.getByRole("dialog").isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
  }
  await page.locator('[aria-label="Top-up"]').click();
  await expect(page.getByTestId("top-up-modal-wrapper")).toBeVisible({
    timeout: 15_000,
  });
}
