import { expect, type Page } from "@playwright/test";
import {
  bet4365SuccessPageCopy,
  bet4365WhatsAppNumber,
  buildBet4365WhatsAppMessage,
  type Bet4365Locale,
} from "../test-data/bet-4365.js";

const CREATED_AT_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const PHONE_PATTERN = /^\+852\d{8}$/;

export async function expectSubmittedPageUrl(page: Page): Promise<void> {
  await expect(page).toHaveURL(/submitted/, { timeout: 60_000 });
}

export async function readSubmittedSessionMeta(page: Page): Promise<{
  createdAt: string;
  phone: string;
}> {
  const meta = await page.evaluate(() => ({
    createdAt: sessionStorage.getItem("created-at"),
    phone: sessionStorage.getItem("phone"),
  }));
  expect(meta.createdAt, "sessionStorage created-at").toMatch(CREATED_AT_PATTERN);
  expect(meta.phone, "sessionStorage phone").toMatch(PHONE_PATTERN);
  return { createdAt: meta.createdAt!, phone: meta.phone! };
}

export async function expectBet4333SuccessLayout(
  page: Page,
  locale: Bet4365Locale,
): Promise<void> {
  const copy = bet4365SuccessPageCopy[locale];
  await expect(page.getByText(copy.title)).toBeVisible({ timeout: 15_000 });

  for (const step of copy.timeline) {
    await expect(page.getByText(step, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(copy.timelineSubtitle)).toBeVisible();
  await expect(page.getByRole("link", { name: copy.whatsappContact })).toBeVisible();
  await expect(page.getByRole("button", { name: copy.backToHome })).toBeVisible();

  const body = await page.locator("body").innerText();
  for (const pattern of copy.obsoleteProgress) {
    expect(body).not.toMatch(pattern);
  }
}

export async function expectWhatsAppTemplatedContact(
  page: Page,
  locale: Bet4365Locale,
): Promise<void> {
  const copy = bet4365SuccessPageCopy[locale];
  const { createdAt, phone } = await readSubmittedSessionMeta(page);
  const link = page.getByRole("link", { name: copy.whatsappContact });
  await expect(link).toBeVisible();

  const href = await link.getAttribute("href");
  expect(href, "WhatsApp href").toBeTruthy();

  const url = new URL(href!);
  expect(url.hostname).toBe("wa.me");
  expect(url.pathname).toBe(`/${bet4365WhatsAppNumber}`);

  const text = url.searchParams.get("text");
  expect(text, "WhatsApp prefilled text").toBeTruthy();
  expect(text).toBe(buildBet4365WhatsAppMessage(locale, createdAt, phone));
  expect(text).toContain(createdAt);
  expect(text).toContain(phone);
}
