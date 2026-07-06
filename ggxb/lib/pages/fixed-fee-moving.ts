import { expect, type Page } from "@playwright/test";
import {
  fillTransportFromWaypoint,
  fillTransportToWaypoint,
} from "./transport-order.js";
import type { TransportWaypointFixture } from "../test-data/transport-order.js";
import {
  bet4377NumberOfPalletsLabel,
  bet4377PalletBodyText,
  type Bet4377Locale,
  type Bet4377Vehicle,
} from "../test-data/bet-4377.js";

const fixedFeeLabels: Record<
  Bet4377Locale,
  {
    moveGoodsDoorToDoor: RegExp;
    nextButton: RegExp;
    fixedFeeOption: RegExp;
    fixedFeeHeading: RegExp;
    tooltipMarker: RegExp;
  }
> = {
  "en-HK": {
    moveGoodsDoorToDoor: /^Move goods door-to-door$/,
    nextButton: /^Next$/,
    fixedFeeOption: /^Fixed fee \(From /,
    fixedFeeHeading: /Fixed fee \(From/i,
    tooltipMarker: /^• Free (cart|forklift) rental is included\./,
  },
  "zh-HK": {
    moveGoodsDoorToDoor: /^上門搬運$/,
    nextButton: /^下一步$/,
    fixedFeeOption: /^定價收費 \(/,
    fixedFeeHeading: /定價收費 \(/i,
    tooltipMarker: /^• 定價收費已包括借/,
  },
};

function mainContent(page: Page) {
  return page.locator('[data-testid="main-content"]');
}

function labelsFor(locale: Bet4377Locale) {
  return fixedFeeLabels[locale];
}

export async function selectTransportVehicle(
  page: Page,
  vehicle: Bet4377Vehicle,
): Promise<void> {
  await mainContent(page).getByText(vehicle, { exact: true }).click();
}

export async function goToTransportOrderDetailsStep(
  page: Page,
  locale: Bet4377Locale,
): Promise<void> {
  const labels = labelsFor(locale);
  await page.getByRole("button", { name: labels.nextButton }).click();
  await page
    .getByRole("dialog")
    .filter({ hasText: /Loading|載入/i })
    .waitFor({ state: "hidden", timeout: 30_000 })
    .catch(() => {});

  await expect(
    mainContent(page).getByText(labels.moveGoodsDoorToDoor),
  ).toBeVisible({ timeout: 15_000 });
}

export async function fillTransportRouteDetails(
  page: Page,
  fixture: { from: TransportWaypointFixture; to: TransportWaypointFixture },
): Promise<void> {
  await fillTransportFromWaypoint(page, fixture.from);
  await fillTransportToWaypoint(page, fixture.to);
}

export async function selectMoveGoodsDoorToDoor(
  page: Page,
  locale: Bet4377Locale,
): Promise<void> {
  await mainContent(page)
    .getByText(labelsFor(locale).moveGoodsDoorToDoor)
    .click();
}

export async function selectFixedFeeOption(
  page: Page,
  locale: Bet4377Locale,
): Promise<void> {
  await mainContent(page).getByText(labelsFor(locale).fixedFeeOption).click();
}

async function markFixedFeeInfoIcon(
  page: Page,
  locale: Bet4377Locale,
): Promise<void> {
  const headingPattern = labelsFor(locale).fixedFeeHeading.source;

  await page.evaluate((pattern) => {
    document
      .querySelectorAll('[data-testid="fixed-fee-info-icon"]')
      .forEach((node) => node.removeAttribute("data-testid"));

    const fixed = [...document.querySelectorAll("p")].find((p) =>
      new RegExp(pattern, "i").test(p.textContent ?? ""),
    );
    const row = fixed?.closest("div")?.parentElement?.parentElement;
    const svg = row?.parentElement?.querySelector("svg.elEQsj");
    svg?.setAttribute("data-testid", "fixed-fee-info-icon");
  }, headingPattern);
}

async function fixedFeeInfoIcon(page: Page, locale: Bet4377Locale) {
  await markFixedFeeInfoIcon(page, locale);
  return mainContent(page).locator('[data-testid="fixed-fee-info-icon"]');
}

export async function hoverFixedFeeInfoIcon(
  page: Page,
  locale: Bet4377Locale,
): Promise<void> {
  const icon = await fixedFeeInfoIcon(page, locale);
  await expect(icon).toBeVisible({ timeout: 15_000 });
  await icon.scrollIntoViewIfNeeded();
  const box = await icon.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  } else {
    await icon.hover({ force: true });
  }
  await page.waitForTimeout(500);
}

export async function readFixedFeeTooltipText(
  page: Page,
  locale: Bet4377Locale,
): Promise<string> {
  const marker = labelsFor(locale).tooltipMarker;
  let tooltip = "";

  await expect
    .poll(
      async () => {
        await hoverFixedFeeInfoIcon(page, locale);
        const snippets = await page.evaluate((patternSource) => {
          const pattern = new RegExp(patternSource);
          return [...document.querySelectorAll("*")]
            .map((el) => el.textContent?.trim())
            .filter((text): text is string => !!text && pattern.test(text));
        }, marker.source);
        tooltip =
          snippets.sort((a, b) => b.length - a.length)[0] ?? "";
        return tooltip.length > 0;
      },
      { timeout: 15_000 },
    )
    .toBe(true);

  return tooltip;
}

export async function expectFixedFeePalletBodyVisible(
  page: Page,
  locale: Bet4377Locale,
  visible: boolean,
): Promise<void> {
  const palletBody = mainContent(page).getByText(bet4377PalletBodyText[locale]);
  const numberOfPallets = mainContent(page).getByText(
    bet4377NumberOfPalletsLabel[locale],
  );

  if (visible) {
    await expect(palletBody).toBeVisible({ timeout: 15_000 });
  } else {
    await expect(palletBody).toBeHidden({ timeout: 15_000 });
  }
}

export async function openFixedFeeMovingForVehicle(
  page: Page,
  fixture: { from: TransportWaypointFixture; to: TransportWaypointFixture },
  vehicle: Bet4377Vehicle,
  locale: Bet4377Locale,
): Promise<void> {
  await fillTransportRouteDetails(page, fixture);
  await selectTransportVehicle(page, vehicle);
  await goToTransportOrderDetailsStep(page, locale);
  await selectMoveGoodsDoorToDoor(page, locale);
}
