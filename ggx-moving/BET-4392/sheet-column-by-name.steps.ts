import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  assertSingleWorkerForSheetMutation,
  canonicalHeaderIndex,
  fetchOrderRowByOrderId,
  restorePendingOrderSheetColumnSwap,
  swapOrderSheetColumnsByHeader,
} from "../lib/sheets/order-sheet.js";
import { stdMovingWaypoints } from "../lib/test-data/order-fixture.js";
import { movingTestContext } from "../lib/test-data/test-context.js";

const { Given, Then, After } = createBdd();

Given(
  "Moving Orders sheet column mutations require a single Playwright worker",
  async () => {
    // Swap + 30s header-cache wait + full std-moving submit + sheet poll.
    test.setTimeout(360_000);
    assertSingleWorkerForSheetMutation();
  },
);

Given(
  "I swap Moving Orders sheet columns {string} and {string}",
  async ({}, headerA: string, headerB: string) => {
    const beforeA = canonicalHeaderIndex(headerA);
    const beforeB = canonicalHeaderIndex(headerB);
    expect(beforeA).toBeGreaterThanOrEqual(0);
    expect(beforeB).toBeGreaterThanOrEqual(0);

    const { indexA, indexB } = await swapOrderSheetColumnsByHeader(
      headerA,
      headerB,
    );
    expect(indexA).not.toBe(beforeA);
    expect(indexB).not.toBe(beforeB);
    expect(indexA).toBe(beforeB);
    expect(indexB).toBe(beforeA);

    // gogox-moving memoizes header→index for 30s after each sync; wait so the
    // order write re-reads the swapped headers instead of stale positions.
    await new Promise((resolve) => setTimeout(resolve, 31_000));
  },
);

Then(
  "the order from and to sheet cells at canonical indexes should reflect the column swap",
  async () => {
    const orderId = movingTestContext.orderId;
    expect(orderId).toBeTruthy();
    const row = await fetchOrderRowByOrderId(orderId!);

    const fromIdx = canonicalHeaderIndex("起點");
    const toIdx = canonicalHeaderIndex("終點");
    expect(fromIdx).toBe(3);
    expect(toIdx).toBe(9);

    // After swapping 起點 ↔ 終點, name-based writes put "to" under fixed index 3
    // and "from" under fixed index 9. Header-based reads (above) stay correct.
    expect(row.raw[fromIdx] ?? "").toContain(stdMovingWaypoints.to.street);
    expect(row.raw[toIdx] ?? "").toContain(stdMovingWaypoints.from.street);
    expect(row.fromAddress).toContain(stdMovingWaypoints.from.street);
    expect(row.toAddress).toContain(stdMovingWaypoints.to.street);
  },
);

After(async () => {
  await restorePendingOrderSheetColumnSwap();
});
