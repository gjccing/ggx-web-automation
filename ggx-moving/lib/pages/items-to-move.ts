import { expect, type Page } from "@playwright/test";

/** Mobile viewport used for the BET-4357 layout checks (~375px wide phone). */
export const MOBILE_VIEWPORT = { width: 375, height: 667 } as const;

/**
 * The category tab strip on items-to-move ("Common / Appliances / Furniture /
 * Others"). The wizard ProgressStepper also uses role="tab" but its tabs have no
 * accessible name, so the category tabs are the role="tab" elements that carry text.
 */
export function categoryTabs(page: Page) {
  return page.getByRole("tab").filter({ hasText: /\S/ });
}

/** Top offset (px, relative to the viewport) of the category tab strip. */
export async function categoryTabsTop(page: Page): Promise<number> {
  return page.evaluate(() => {
    const tab = [...document.querySelectorAll('[role="tab"]')].find(
      (t) => (t.textContent ?? "").trim().length > 0,
    );
    if (!tab) throw new Error("Category tab strip not found on items-to-move");
    return Math.round(tab.getBoundingClientRect().top);
  });
}

/**
 * Scrolls the items-to-move list to the bottom. The list scrolls inside an inner
 * `overflow-auto` container (not the window), so we target the largest scrollable
 * element. Returns how many pixels it actually scrolled.
 */
export async function scrollItemsListToBottom(page: Page): Promise<number> {
  return page.evaluate(() => {
    const scrollables = [...document.querySelectorAll<HTMLElement>("*")].filter(
      (el) => {
        const cs = getComputedStyle(el);
        return (
          (cs.overflowY === "auto" || cs.overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight + 5
        );
      },
    );
    if (scrollables.length === 0) {
      throw new Error("No scrollable item list found on items-to-move");
    }
    const list = scrollables.sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
    const start = list.scrollTop;
    list.scrollTop = list.scrollHeight;
    return list.scrollTop - start;
  });
}

/** Asserts the category tab strip is visible and pinned within the viewport. */
export async function expectCategoryTabsPinned(
  page: Page,
  topBefore: number,
  topAfter: number,
): Promise<void> {
  await expect(categoryTabs(page).first()).toBeVisible();
  expect(topAfter).toBe(topBefore);
  expect(topAfter).toBeGreaterThanOrEqual(0);
  expect(topAfter).toBeLessThan(MOBILE_VIEWPORT.height);
}
