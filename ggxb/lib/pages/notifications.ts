import type { Page } from "@playwright/test";

/** Close order toasts that cover the place-order actions. */
export async function dismissNotifications(page: Page): Promise<void> {
  const dismissAll = page.getByRole("button", {
    name: /DISMISS ALL|全部關閉|全部清除/i,
  });
  if (await dismissAll.isVisible().catch(() => false)) {
    await dismissAll.click();
  }

  const dismiss = page.getByRole("button", { name: /^DISMISS$|^關閉$/ });
  for (let i = 0; i < 3; i += 1) {
    if (!(await dismiss.first().isVisible().catch(() => false))) break;
    await dismiss.first().click();
  }

  const close = page.locator("button").filter({
    has: page.locator("span", { hasText: /^X$/i }),
  });
  if (await close.first().isVisible().catch(() => false)) {
    await close.first().click();
  }
}
