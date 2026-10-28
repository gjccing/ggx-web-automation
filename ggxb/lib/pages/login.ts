import { expect, type Page } from "@playwright/test";

const SIGN_UP_UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign"] as const;

export type SignUpUtmParam = (typeof SIGN_UP_UTM_PARAMS)[number];

export async function expectSignUpLinkParam(
  page: Page,
  name: SignUpUtmParam,
  value: string,
): Promise<void> {
  const link = page.locator('a[href*="/signup"]').first();
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  expect(href, "sign-up link should have an href").toBeTruthy();
  const params = new URL(href!, "https://ggxb.local").searchParams;
  expect(params.get(name)).toBe(value);
}
