import type { Page } from "@playwright/test";

/** Close the post-place-order toast if present. */
export async function dismissNotifications(page: Page): Promise<void> {
  const dismissAll = page.getByRole("button", { name: /DISMISS ALL/i });
  if (await dismissAll.isVisible().catch(() => false)) {
    await dismissAll.click();
    return;
  }

  const close = page.locator("button").filter({ has: page.locator("span", { hasText: "X" }) });
  if (await close.first().isVisible().catch(() => false)) {
    await close.first().click();
  }
}
