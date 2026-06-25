import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { ggxbBaseUrl, type GgxbRegion } from '../../env.js';

const { Given, Then } = createBdd();

Given('I open the GGXB {string} homepage', async ({ page }, region: string) => {
  const normalized = region.toLowerCase();
  if (normalized !== 'hk' && normalized !== 'sg') {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }

  const baseUrl = ggxbBaseUrl(normalized as GgxbRegion);
  const response = await page.goto(baseUrl);
  expect(response, 'navigation should return a response').not.toBeNull();
  expect(response!.ok(), `expected HTTP 2xx for ${baseUrl}`).toBeTruthy();
});

Then('the page should load successfully', async ({ page }) => {
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('body')).toBeVisible();
});
