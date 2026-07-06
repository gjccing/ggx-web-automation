import { expect, type Page } from "@playwright/test";
import {
  fillTransportFromWaypoint,
  fillTransportToWaypoint,
} from "./transport-order.js";
import type { TransportWaypointFixture } from "../test-data/transport-order.js";
import type { Bet4377Vehicle } from "../test-data/bet-4377.js";
import { BET4377_PALLET_BODY_TEXT } from "../test-data/bet-4377.js";

function mainContent(page: Page) {
  return page.locator('[data-testid="main-content"]');
}

export async function selectTransportVehicle(
  page: Page,
  vehicle: Bet4377Vehicle,
): Promise<void> {
  await mainContent(page).getByText(vehicle, { exact: true }).click();
}

export async function goToTransportOrderDetailsStep(page: Page): Promise<void> {
  await page.getByRole("button", { name: /^Next$/ }).click();
  await page
    .getByRole("dialog")
    .filter({ hasText: /Loading/i })
    .waitFor({ state: "hidden", timeout: 30_000 })
    .catch(() => {});

  await expect(
    mainContent(page).getByText(/^Move goods door-to-door$/),
  ).toBeVisible({ timeout: 15_000 });
}

export async function fillTransportRouteDetails(
  page: Page,
  fixture: { from: TransportWaypointFixture; to: TransportWaypointFixture },
): Promise<void> {
  await fillTransportFromWaypoint(page, fixture.from);
  await fillTransportToWaypoint(page, fixture.to);
}

export async function selectMoveGoodsDoorToDoor(page: Page): Promise<void> {
  await mainContent(page).getByText(/^Move goods door-to-door$/).click();
}

export async function selectFixedFeeOption(page: Page): Promise<void> {
  await mainContent(page).getByText(/^Fixed fee \(From /).click();
}

async function markFixedFeeInfoIcon(page: Page): Promise<void> {
  await page.evaluate(() => {
    document
      .querySelectorAll('[data-testid="fixed-fee-info-icon"]')
      .forEach((node) => node.removeAttribute("data-testid"));

    const fixed = [...document.querySelectorAll("p")].find((p) =>
      /Fixed fee \(From/i.test(p.textContent ?? ""),
    );
    const row = fixed?.closest("div")?.parentElement?.parentElement;
    const svg = row?.parentElement?.querySelector("svg.elEQsj");
    svg?.setAttribute("data-testid", "fixed-fee-info-icon");
  });
}

async function fixedFeeInfoIcon(page: Page) {
  await markFixedFeeInfoIcon(page);
  return mainContent(page).locator('[data-testid="fixed-fee-info-icon"]');
}

export async function hoverFixedFeeInfoIcon(page: Page): Promise<void> {
  const icon = await fixedFeeInfoIcon(page);
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

export async function readFixedFeeTooltipText(page: Page): Promise<string> {
  let tooltip = "";

  await expect
    .poll(async () => {
      await hoverFixedFeeInfoIcon(page);
      const snippets = await page.evaluate(() =>
        [...document.querySelectorAll("*")]
          .map((el) => el.textContent?.trim())
          .filter(
            (text): text is string =>
              !!text &&
              (/^• Free (cart|forklift) rental is included\./.test(text) ||
                text.includes("• Free cart rental is included.")),
          ),
      );
      tooltip = snippets[0] ?? "";
      return tooltip.length > 0;
    }, { timeout: 15_000 })
    .toBe(true);

  return tooltip;
}

export async function expectFixedFeePalletBodyVisible(
  page: Page,
  visible: boolean,
): Promise<void> {
  const palletBody = mainContent(page).getByText(BET4377_PALLET_BODY_TEXT);
  if (visible) {
    await expect(palletBody).toBeVisible({ timeout: 15_000 });
    await expect(mainContent(page).getByText(/^Number of pallets$/)).toBeVisible();
  } else {
    await expect(palletBody).toBeHidden({ timeout: 15_000 });
    await expect(mainContent(page).getByText(/^Number of pallets$/)).toBeHidden();
  }
}

export async function openFixedFeeMovingForVehicle(
  page: Page,
  fixture: { from: TransportWaypointFixture; to: TransportWaypointFixture },
  vehicle: Bet4377Vehicle,
): Promise<void> {
  await fillTransportRouteDetails(page, fixture);
  await selectTransportVehicle(page, vehicle);
  await goToTransportOrderDetailsStep(page);
  await selectMoveGoodsDoorToDoor(page);
}
