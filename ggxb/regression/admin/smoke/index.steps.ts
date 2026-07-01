import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { ggxbAdminBaseUrl, type GgxbRegion } from "../../../env.js";

const { Given, Then } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

Given("I open the GGXB {string} admin panel", async ({ page }, region: string) => {
  const baseUrl = ggxbAdminBaseUrl(parseRegion(region));
  const response = await page.goto(baseUrl);
  expect(response, "navigation should return a response").not.toBeNull();
  expect(response!.ok(), `expected HTTP 2xx for ${baseUrl}`).toBeTruthy();
});

Then("the admin login page should load successfully", async ({ page }) => {
  await expect(page).toHaveURL(/\/admin\/login(?:\?|#|$)/);
  await expect(page).toHaveTitle(/Admin Panel/i);
  await expect(
    page.getByRole("heading", { name: /Admin Panel/i }),
  ).toBeVisible();
  await expect(page.locator('[name="admin_user[email]"]')).toBeVisible();
  await expect(page.locator('[name="admin_user[password]"]')).toBeVisible();
});
