import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { ggxMovingBaseUrl } from '../../env.js';

const { Given, Then } = createBdd();

Given('I open the product homepage', async ({ page }) => {
  const response = await page.goto(ggxMovingBaseUrl());
  expect(response, 'navigation should return a response').not.toBeNull();
  expect(response!.ok(), `expected HTTP 2xx for ${ggxMovingBaseUrl()}`).toBeTruthy();
});

Then('the page should load successfully', async ({ page }) => {
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('body')).toBeVisible();
});
