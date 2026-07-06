import type { Page } from "@playwright/test";

export async function getSessionStorage<T>(
  page: Page,
  key: string,
): Promise<T | null> {
  return page.evaluate((k) => {
    const raw = sessionStorage.getItem(k);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, key);
}

export async function clearSessionStorageKey(
  page: Page,
  key: string,
): Promise<void> {
  await page.evaluate((k) => sessionStorage.removeItem(k), key);
}

export async function clearAllMovingSession(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const key of [
      "std-moving",
      "disposal-only",
      "corporate-moving-services",
      "overseas-moving",
      "utm",
      "std-moving-created-at",
      "std-moving-phone",
      "disposal-only-created-at",
      "disposal-only-phone",
    ]) {
      sessionStorage.removeItem(key);
    }
  });
}
