import { expect, type Page } from "@playwright/test";
import { movingLabels } from "../labels.js";

/** Mobile viewport used for the BET-4357 layout checks (~375px wide phone). */
export const MOBILE_VIEWPORT = { width: 375, height: 667 } as const;

/** Manual free-text list textarea on items-to-move. */
export function manualItemsTextbox(page: Page) {
  return page.getByRole("textbox", {
    name: /Example:|例如：|Television|電視/i,
  });
}

/** Dialog title for discarding manually entered item text (BET-4361). */
export function discardTextDialog(page: Page) {
  return page.getByRole("heading", { name: movingLabels.discardTextContent });
}

/**
 * Switches from the categorized item picker to the free-text list:
 * "Already have a list?" → confirm "Enter my own list".
 */
export async function switchToManualItemList(page: Page): Promise<void> {
  await page.getByRole("button", { name: movingLabels.alreadyHaveAList }).click();
  await page.getByRole("heading", { name: movingLabels.alreadyHaveAList }).waitFor();
  await page.getByRole("button", { name: movingLabels.enterMyOwnList }).click();
  await expect(manualItemsTextbox(page)).toBeVisible({ timeout: 10_000 });
  await expect(
    page.getByRole("button", { name: movingLabels.selectFromList }),
  ).toBeVisible();
}

/** Types into the manual item list after switching from the picker. */
export async function typeManualItemList(
  page: Page,
  text: string,
): Promise<void> {
  const box = manualItemsTextbox(page);
  await box.fill(text);
  await expect(box).toHaveValue(text);
}

/** Clicks the "Select from list" header control (may open the discard dialog). */
export async function clickSelectFromList(page: Page): Promise<void> {
  await page.getByRole("button", { name: movingLabels.selectFromList }).click();
}

export async function expectDiscardTextDialogVisible(page: Page): Promise<void> {
  await expect(discardTextDialog(page)).toBeVisible({ timeout: 10_000 });
  await expect(
    page.getByRole("button", { name: movingLabels.selectItemsInstead }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: movingLabels.goBack }),
  ).toBeVisible();
}

/** Cancels the discard dialog and stays on the manual list. */
export async function cancelDiscardTextDialog(page: Page): Promise<void> {
  await page.getByRole("button", { name: movingLabels.goBack }).click();
  await expect(discardTextDialog(page)).toBeHidden({ timeout: 10_000 });
}

/** Confirms discarding manual text and returns to the item picker. */
export async function confirmDiscardTextDialog(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: movingLabels.selectItemsInstead })
    .click();
  await expect(discardTextDialog(page)).toBeHidden({ timeout: 10_000 });
  await expect(
    page.getByRole("button", { name: movingLabels.alreadyHaveAList }),
  ).toBeVisible({ timeout: 10_000 });
  await expect(manualItemsTextbox(page)).toHaveCount(0);
}

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

/**
 * The item picker groups items under section headers that mirror the category
 * tabs, in this order. Scrolling a section to the top of the list should mark
 * the matching tab as active (BET-4358).
 */
export const CATEGORY_ORDER = [
  "Common",
  "Appliances",
  "Furniture",
  "Others",
] as const;

export type CategoryName = (typeof CATEGORY_ORDER)[number];

/** Accessible name of the currently active (aria-selected) category tab. */
export async function activeCategoryTabName(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const tab = [...document.querySelectorAll('[role="tab"]')]
      .filter((t) => (t.textContent ?? "").trim().length > 0)
      .find((t) => t.getAttribute("aria-selected") === "true");
    return tab ? (tab.textContent ?? "").trim() : null;
  });
}

/**
 * Offset (px) of each category section header measured from the top of the
 * scrollable item list. Used to scroll a given section to the top so its tab
 * should become active.
 */
export async function categorySectionOffsets(
  page: Page,
): Promise<{ name: string; offset: number }[]> {
  return page.evaluate((names: readonly string[]) => {
    const list = [...document.querySelectorAll<HTMLElement>("*")]
      .filter((el) => {
        const cs = getComputedStyle(el);
        return (
          (cs.overflowY === "auto" || cs.overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight + 5
        );
      })
      .sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
    if (!list) throw new Error("No scrollable item list found on items-to-move");
    const listTop = list.getBoundingClientRect().top;
    return names.map((name) => {
      const header = [...list.querySelectorAll<HTMLElement>("div")].find(
        (el) =>
          (el.textContent ?? "").trim() === name &&
          el.querySelectorAll("div").length === 0,
      );
      if (!header) throw new Error(`Section header "${name}" not found`);
      return {
        name,
        offset: Math.round(
          header.getBoundingClientRect().top - listTop + list.scrollTop,
        ),
      };
    });
  }, CATEGORY_ORDER as readonly string[]);
}

/**
 * Smoothly scrolls the item list to a target scrollTop in small steps so the
 * section headers actually cross the top of the viewport. The active-tab
 * indicator is driven by an IntersectionObserver, which only fires while the
 * headers move — an instant `scrollTop` jump can skip the observer entirely.
 */
export async function smoothScrollItemsList(
  page: Page,
  target: number,
): Promise<void> {
  await page.evaluate(async (target: number) => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const list = [...document.querySelectorAll<HTMLElement>("*")]
      .filter((el) => {
        const cs = getComputedStyle(el);
        return (
          (cs.overflowY === "auto" || cs.overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight + 5
        );
      })
      .sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
    if (!list) throw new Error("No scrollable item list found on items-to-move");
    const max = list.scrollHeight - list.clientHeight;
    const clamped = Math.max(0, Math.min(max, target));
    const step = clamped >= list.scrollTop ? 60 : -60;
    let guard = 0;
    while (
      ((step > 0 && list.scrollTop < clamped) ||
        (step < 0 && list.scrollTop > clamped)) &&
      guard++ < 500
    ) {
      list.scrollTop += step;
      await sleep(16);
    }
    list.scrollTop = clamped;
    await sleep(200);
  }, target);
}

/**
 * Verifies the active category tab tracks the section scrolled to the top of the
 * list, visiting the sections in `order`. Used for both scroll directions so a
 * scroll-up sweep must mirror a scroll-down sweep (BET-4358).
 */
export async function expectActiveTabTracksSections(
  page: Page,
  order: readonly string[],
): Promise<void> {
  const offsets = await categorySectionOffsets(page);
  const offsetByName = new Map(offsets.map((o) => [o.name, o.offset]));

  for (const name of order) {
    const offset = offsetByName.get(name);
    if (offset === undefined) {
      throw new Error(`Missing offset for section "${name}"`);
    }
    // Align the section header just below the top of the list viewport.
    await smoothScrollItemsList(page, offset - 4);
    await expect
      .poll(() => activeCategoryTabName(page), { timeout: 6_000 })
      .toBe(name);
  }
}

/** Category tab label (en-HK / zh-HK). */
export const CATEGORY_TAB_NAME: Record<CategoryName, RegExp> = {
  Common: /^Common$|^常見$/,
  Appliances: /^Appliances$|^電器$/,
  Furniture: /^Furniture$|^傢俬$/,
  Others: /^Others$|^其他$/,
};

/** Clicks a category tab so its section scrolls into view. */
export async function openItemsCategory(
  page: Page,
  category: CategoryName,
): Promise<void> {
  const tab = page.getByRole("tab", { name: CATEGORY_TAB_NAME[category] });
  await expect(tab).toBeVisible({ timeout: 10_000 });
  await tab.click();
  await expect
    .poll(() => activeCategoryTabName(page), { timeout: 6_000 })
    .toBe(category);
}

/**
 * Card row for a simple (non-variant) catalog item. Prefer exact name match so
 * "Bed frame" does not match "Hydraulic bed frame"-style cousins.
 */
export function simpleItemRow(page: Page, itemName: string) {
  return page
    .locator("div.bg-white")
    .filter({ has: page.getByText(itemName, { exact: true }) })
    .filter({ has: page.getByLabel("Increment") })
    .first();
}

/** Sets a simple item stepper to `quantity` via Increment clicks. */
export async function setSimpleItemQuantity(
  page: Page,
  itemName: string,
  quantity: number,
): Promise<void> {
  if (quantity < 1) {
    throw new Error(`quantity must be >= 1 (got ${quantity})`);
  }
  const row = simpleItemRow(page, itemName);
  await expect(row).toBeVisible({ timeout: 10_000 });
  await row.scrollIntoViewIfNeeded();
  const increment = row.getByLabel("Increment");
  for (let i = 0; i < quantity; i++) {
    await increment.click();
  }
  await expect(row.locator("span.min-w-6")).toHaveText(String(quantity));
}

/**
 * Completes the items builder (fires Mixpanel `items_builder_completed`).
 * Primary CTA is "Next" on the picker footer.
 */
export async function confirmItemsBuilder(page: Page): Promise<void> {
  await page.getByRole("button", { name: movingLabels.next }).click();
}
