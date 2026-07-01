import { expect, type Page } from "@playwright/test";
import {
  ggxbAdminBaseUrl,
  ggxbAdminTestUser,
  type GgxbRegion,
} from "../../env.js";

export async function openAdminLoginPage(
  page: Page,
  region: GgxbRegion,
): Promise<void> {
  const base = ggxbAdminBaseUrl(region);
  const response = await page.goto(base);
  expect(response, "admin navigation should return a response").not.toBeNull();
  expect(response!.ok(), `expected HTTP 2xx for ${base}`).toBeTruthy();
  await expect(page).toHaveURL(/\/admin\/login(?:\?|#|$)/);
  await expect(
    page.getByRole("heading", { name: /Admin Panel/i }),
  ).toBeVisible();
}

export async function logInAsAdminUser(
  page: Page,
  region: GgxbRegion,
): Promise<void> {
  const { email, password } = ggxbAdminTestUser(region);
  await page.locator('[name="admin_user[email]"]').fill(email);
  await page.locator('[name="admin_user[password]"]').fill(password);
  await page.getByRole("button", { name: "Login" }).click();
}

export async function expectAuthenticatedAdminLanding(
  page: Page,
): Promise<void> {
  await expect(page).not.toHaveURL(/\/login(?:\?|#|$)/);
  await expect(page).toHaveURL(/\/admin(?:\?|#|$)/, { timeout: 30_000 });
  await expect(page).toHaveTitle(/Admin Panel/i);
  await expect(
    page.getByRole("heading", { name: /Welcome to GoGoVan Admin Panel/i }),
  ).toBeVisible({ timeout: 30_000 });
}

export async function loginAdminViaUi(
  page: Page,
  region: GgxbRegion,
): Promise<void> {
  await openAdminLoginPage(page, region);
  await logInAsAdminUser(page, region);
  await expectAuthenticatedAdminLanding(page);
}
