import { expect, type Page } from "@playwright/test";
import { ggxMovingBaseUrl, type GgxMovingLocale } from "../../env.js";
import { movingLabels } from "../labels.js";

export async function openHomepage(
  page: Page,
  locale: GgxMovingLocale = "en-HK",
  query = "",
  options?: { clearSession?: boolean },
): Promise<void> {
  const url = `${ggxMovingBaseUrl(locale)}${query}`;
  const response = await page.goto(url);
  expect(response, `navigation to ${url}`).not.toBeNull();
  expect(response!.ok()).toBeTruthy();
  if (options?.clearSession !== false) {
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
    if (query) {
      await page.goto(url);
    } else {
      await page.reload();
    }
  }
  await expect(
    page.getByRole("heading", { name: /Select your moving type|請選擇您的搬運服務/ }),
  ).toBeVisible();
}

export async function selectService(
  page: Page,
  service:
    | "standard"
    | "corporate"
    | "van-rental"
    | "disposal"
    | "overseas",
): Promise<void> {
  const heading =
    service === "standard"
      ? movingLabels.standardMoving
      : service === "corporate"
        ? movingLabels.specialMoving
        : service === "van-rental"
          ? movingLabels.vanRental
          : service === "disposal"
            ? movingLabels.disposalOnly
            : movingLabels.overseasMoving;

  await page.getByRole("heading", { name: heading }).click();
}

export async function clickHomepageCta(page: Page): Promise<void> {
  const estimate = page.getByRole("button", { name: movingLabels.estimateNow });
  const next = page.getByRole("button", { name: movingLabels.next });
  if (await estimate.isVisible()) {
    await estimate.click();
    return;
  }
  await next.click();
}

export async function expectVanRentalDownloadDialog(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { name: movingLabels.downloadDialogTitle }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: movingLabels.downloadApp })).toBeVisible();
  await page.getByRole("button", { name: movingLabels.gotIt }).click();
  await expect(
    page.getByRole("heading", { name: movingLabels.downloadDialogTitle }),
  ).toBeHidden();
}

export async function readStandardMovingBody1(page: Page): Promise<string> {
  const card = page
    .getByRole("heading", { name: movingLabels.standardMoving, level: 2 })
    .locator("xpath=ancestor::div[contains(@class,'text-dark-100')][1]");
  const body1 = card.locator("div.caption.whitespace-pre-line").first();
  await expect(body1).toBeVisible();
  return (await body1.innerText()).trim();
}

export async function switchLanguage(
  page: Page,
  target: "en-HK" | "zh-HK",
): Promise<void> {
  const trigger = page.getByRole("button", { name: /^(EN|中)$/ });
  await trigger.click();
  const menuItem =
    target === "zh-HK"
      ? page.getByRole("menuitem", { name: movingLabels.traditionalChinese })
      : page.getByRole("menuitem", { name: movingLabels.english });
  await menuItem.click();
  await expect(page).toHaveURL(new RegExp(`/${target}`));
}
