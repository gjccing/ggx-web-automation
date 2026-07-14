import { expect, type Locator, type Page } from "@playwright/test";
import { movingLabels } from "./labels.js";

/**
 * Stabilize the page for visual smoke comparisons: kill animations,
 * wait for fonts, and wait until the route's main UI has hydrated.
 */
export async function stabilizeForScreenshot(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      html {
        scroll-behavior: auto !important;
      }
      /* Local Next.js / Vercel overlays — keep baselines portable to staging. */
      nextjs-portal,
      #__next-build-watcher,
      [data-nextjs-dialog-overlay],
      [data-nextjs-toast] {
        display: none !important;
        visibility: hidden !important;
      }
    `,
  });

  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });

  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await waitForRouteContent(page);
}

/** Route-aware ready checks so we never snapshot an empty app shell. */
async function waitForRouteContent(page: Page): Promise<void> {
  const path = new URL(page.url()).pathname;

  if (/\/(en-HK|zh-HK)\/?$/.test(path)) {
    // Van-rental CTA opens a modal on the homepage — prefer that ready state.
    const downloadDialog = page.getByRole("heading", {
      name: movingLabels.downloadDialogTitle,
    });
    if (await downloadDialog.isVisible().catch(() => false)) {
      return;
    }
    await expect(
      page.getByRole("heading", {
        name: /Select your moving type|請選擇您的搬運服務/,
      }),
    ).toBeVisible({ timeout: 15_000 });
    return;
  }

  if (path.includes("move-details") || path.includes("disposal-details")) {
    // Prefer WaypointField dialog content when the overlay is open.
    const street = page
      .getByRole("dialog")
      .getByRole("textbox", { name: movingLabels.streetAddress });
    if (await street.isVisible().catch(() => false)) {
      await expect(street).toBeVisible({ timeout: 15_000 });
      return;
    }
    await expect(
      page.getByRole("button", { name: movingLabels.from }),
    ).toBeVisible({ timeout: 15_000 });
    return;
  }

  if (path.includes("items-to-move")) {
    await expect(
      page.getByRole("heading", { name: /items to move|搬運物品/i }),
    ).toBeVisible({ timeout: 30_000 });

    // Fullscreen manual list replaces the categorized picker.
    const manual = page.getByRole("textbox", {
      name: /Example:|例如：|Television|電視/i,
    });
    if (await manual.isVisible().catch(() => false)) {
      await expect(manual).toBeVisible({ timeout: 15_000 });
      await expect(
        page.getByRole("button", { name: movingLabels.selectFromList }),
      ).toBeVisible();
      await page.waitForTimeout(1_000);
      return;
    }

    // Heading paints first; the LargeItemSelect list mounts a beat later.
    await expect(
      page.getByRole("tab").filter({ hasText: /Common|常用|Appliances|家電/ }).first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("button", { name: movingLabels.alreadyHaveAList }),
    ).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(async () => (await page.locator("body").innerText()).trim().length, {
        timeout: 30_000,
        intervals: [500, 1_000],
      })
      .toBeGreaterThan(400);
    // Extra settle so list images / counters finish painting.
    await page.waitForTimeout(3_000);
    return;
  }

  if (path.includes("extra-services")) {
    await expect(
      page.getByRole("heading", { name: /extra services|額外服務/i }),
    ).toBeVisible({ timeout: 15_000 });
    return;
  }

  if (path.includes("final-details")) {
    await expect(
      page.getByRole("textbox", { name: movingLabels.preferredName }),
    ).toBeVisible({ timeout: 15_000 });
    return;
  }

  if (path.includes("submitted")) {
    await expect(page.getByText(movingLabels.requestSubmitted)).toBeVisible({
      timeout: 15_000,
    });
    return;
  }

  if (path.includes("corporate-moving") || path.includes("overseas-moving")) {
    await expect(
      page.getByRole("textbox", { name: movingLabels.preferredName }),
    ).toBeVisible({ timeout: 15_000 });
    return;
  }
}

export function defaultVisualMasks(page: Page): Locator[] {
  const path = new URL(page.url()).pathname;
  const masks: Locator[] = [];

  // Prefer precise date controls over broad button/text regexes so overlays
  // (WaypointField dialog) are not accidentally pink-boxed.
  if (
    path.includes("move-details") ||
    path.includes("disposal-details") ||
    path.includes("corporate-moving") ||
    path.includes("overseas-moving") ||
    path.includes("final-details")
  ) {
    masks.push(
      page
        .locator("button")
        .filter({
          hasText:
            /^\d{4}-\d{2}-\d{2}$|^(Mon|Tue|Wed|Thu|Fri|Sat|Sun|星期一|星期二|星期三|星期四|星期五|星期六|星期日)/i,
        }),
    );
    masks.push(
      page.getByText(
        /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b.*\d{1,2}/i,
      ),
    );
  }

  if (path.includes("final-details")) {
    // Live estimate e.g. "$800up" / "HK$800".
    masks.push(page.getByText(/HK\$|\$\s?\d+/i));
  }

  if (path.includes("submitted")) {
    // Prefetched WhatsApp deep-link can embed created-at / phone.
    masks.push(page.getByRole("link", { name: /WhatsApp|聯絡|6467/i }));
  }

  return masks;
}

export async function expectUiSnapshot(
  page: Page,
  name: string,
  options?: {
    fullPage?: boolean;
    mask?: Locator[];
    maxDiffPixelRatio?: number;
  },
): Promise<void> {
  await stabilizeForScreenshot(page);

  const mask = [...defaultVisualMasks(page), ...(options?.mask ?? [])];

  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: options?.fullPage ?? true,
    animations: "disabled",
    maxDiffPixelRatio: options?.maxDiffPixelRatio ?? 0.03,
    mask,
  });
}
