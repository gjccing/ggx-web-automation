import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, Then } = createBdd();

const BASE_URL_ENV = 'GGXB_BASE_URL';

Given('I open the product homepage', async ({ page }) => {
  const baseUrl = process.env[BASE_URL_ENV];
  if (!baseUrl) {
    throw new Error(`Set ${BASE_URL_ENV} in the repo root .env file`);
  }

  const response = await page.goto(baseUrl);
  expect(response, 'navigation should return a response').not.toBeNull();
  expect(response!.ok(), `expected HTTP 2xx for ${baseUrl}`).toBeTruthy();
});

Then('the page should load successfully', async ({ page }) => {
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('body')).toBeVisible();
});
