import { expect, type Page } from "@playwright/test";
import { ggxbBaseUrl, ggxbTestUser, type GgxbRegion } from "../env.js";
import { ensureEnglish } from "./navigation/side-menu.js";

export async function openLoginPage(
  page: Page,
  region: GgxbRegion,
): Promise<void> {
  const base = ggxbBaseUrl(region).replace(/\/$/, "");
  const response = await page.goto(`${base}/login`);
  expect(response, "login navigation should return a response").not.toBeNull();
  expect(response!.ok(), `expected HTTP 2xx for ${base}/login`).toBeTruthy();
  await expect(page.getByTestId("login-form")).toBeVisible();
}

/** HK login footer — no-op when English is already active (button disabled). */
export async function switchToEnglishIfAvailable(page: Page): Promise<void> {
  const english = page.getByRole("button", { name: "English", exact: true });
  if (await english.isVisible() && (await english.isEnabled())) {
    await english.click();
  }
}

export async function logInAsMasterUser(
  page: Page,
  region: GgxbRegion,
): Promise<void> {
  const { email, password } = ggxbTestUser(region);
  await page.locator('[name="email"]').fill(email);
  await page.locator('[name="password"]').fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

/** Post-login landing varies by region and `homepage_access` feature flag. */
export async function expectAuthenticatedLanding(page: Page): Promise<void> {
  await expect(page).not.toHaveURL(/\/login(?:\?|#|$)/);
  await expect(page).toHaveURL(/\/(home|van\/order)(?:\/|$|\?|#)/, {
    timeout: 30_000,
  });

  const loadingDialog = page.getByRole("dialog").filter({ hasText: /Loading/i });
  if (await loadingDialog.isVisible().catch(() => false)) {
    await expect(loadingDialog).toBeHidden({ timeout: 30_000 });
  }

  // `body` can stay `visibility:hidden` behind the loading overlay — wait for app chrome.
  await expect(
    page.locator('[data-testid="navigation-bar-footer-menu-user"]'),
  ).toBeVisible({ timeout: 30_000 });
}

export async function loginViaUi(
  page: Page,
  region: GgxbRegion,
  options?: { english?: boolean },
): Promise<void> {
  await openLoginPage(page, region);
  if (options?.english !== false && region === "hk") {
    await switchToEnglishIfAvailable(page);
  }
  await logInAsMasterUser(page, region);
  await expectAuthenticatedLanding(page);
  if (options?.english !== false && region === "hk") {
    await ensureEnglish(page);
  }
}
