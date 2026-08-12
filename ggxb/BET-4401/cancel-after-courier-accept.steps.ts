import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { type GgxbRegion } from "../env.js";
import {
  acceptDeliveryOrderByTid,
  completeDeliveryOrderByUuid,
  listInProgressDeliveryOrders,
  pickUpDeliveryOrderByUuid,
} from "../lib/api/da/delivery.js";
import {
  cancelAcceptedDeliveryOrderExpectInstruction,
  closeDeliveryOrderDrawerIfOpen,
  getDeliveryDropOffCode,
  getDeliveryOrderId,
  getDeliveryOrderStatus,
  getDeliveryPickUpCode,
  waitForDeliveryOrderCodesFromC3,
  waitForDeliveryOrderStatus,
} from "../lib/pages/delivery-order-management.js";
import { ggxbBaseUrl } from "../env.js";
import { setListDateRange } from "../lib/pages/date-range-filter.js";

const { When, Then } = createBdd();

/** Merchant tid from the open order-detail drawer. */
let lastDeliveryTid: string | undefined;
/** Order UUID from the DA accept response. */
let lastDeliveryUuid: string | undefined;
/** Message captured from the cancellation-instruction dialog. */
let lastCancelInstructionMessage: string | undefined;

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

/**
 * Finish hanging DA in-progress orders (limit 7) so accept is not blocked.
 * Runs on OM before place-order; does not keep a detail drawer open.
 */
When(
  "I free courier delivery capacity for {string}",
  async ({ page }, region: string) => {
    test.setTimeout(300_000);
    const r = parseRegion(region);
    const inProgress = await listInProgressDeliveryOrders(r);
    if (inProgress.length === 0) return;

    const base = ggxbBaseUrl(r).replace(/\/$/, "");
    await page.goto(`${base}/delivery/order-management`);
    await setListDateRange(page, "01/07/26", "31/12/26");

    for (const order of inProgress) {
      if (!order.uuid || !order.tid) continue;
      await closeDeliveryOrderDrawerIfOpen(page);
      const link = page.getByText(new RegExp(`^#${order.tid}$`)).first();
      if (!(await link.isVisible().catch(() => false))) continue;

      try {
        const codes = await waitForDeliveryOrderCodesFromC3(page, async () => {
          await link.click({ force: true });
        });
        if (!/picked_up/i.test(order.status ?? "")) {
          await pickUpDeliveryOrderByUuid(r, order.uuid, codes.referenceCode);
        }
        await completeDeliveryOrderByUuid(r, order.uuid, codes.dropOffCode);
      } catch {
        // Other-org / already terminal orders are skipped.
      }
    }
  },
);

When(
  "a courier accepts the current delivery order via DA API for {string}",
  async ({ page }, region: string) => {
    test.setTimeout(240_000);
    const tid = await getDeliveryOrderId(page);
    lastDeliveryTid = tid;
    const result = await acceptDeliveryOrderByTid(parseRegion(region), tid);
    lastDeliveryUuid = result.uuid;
    expect(result.status).toMatch(/accept/i);
  },
);

Then(
  "the delivery order status should match {string}",
  async ({ page }, pattern: string) => {
    // Stay on the open detail drawer — status must update via websocket (no reload).
    const status = await waitForDeliveryOrderStatus(page, pattern);
    expect(status).toMatch(new RegExp(pattern, "i"));
  },
);

When("I cancel the accepted delivery order", async ({ page }) => {
  lastCancelInstructionMessage =
    await cancelAcceptedDeliveryOrderExpectInstruction(page);
});

Then("the cancellation instruction dialog should ask to call GoGoX", async () => {
  expect(lastCancelInstructionMessage).toBeTruthy();
  expect(lastCancelInstructionMessage!).toMatch(
    /3590\s*8975|call GoGoX|聯絡|致電|客服/i,
  );
});

Then("the delivery order should still not be cancelled", async ({ page }) => {
  const status = await getDeliveryOrderStatus(page);
  expect(status).not.toMatch(/Order cancelled|訂單已取消/i);
  expect(status).toMatch(/Accepted|接單|courier|driver/i);
});

When(
  "a courier picks up the current delivery order via DA API for {string}",
  async ({ page }, region: string) => {
    test.setTimeout(240_000);
    const uuid = lastDeliveryUuid;
    if (!uuid) {
      throw new Error(
        "Missing delivery order UUID — run the DA accept step first",
      );
    }
    const pickUpCode = await getDeliveryPickUpCode(page);
    const result = await pickUpDeliveryOrderByUuid(
      parseRegion(region),
      uuid,
      pickUpCode,
    );
    expect(result.status).toMatch(/picked_up|pick/i);
  },
);

When(
  "a courier completes the current delivery order via DA API for {string}",
  async ({ page }, region: string) => {
    test.setTimeout(240_000);
    const uuid = lastDeliveryUuid;
    if (!uuid) {
      throw new Error(
        "Missing delivery order UUID — run the DA accept step first",
      );
    }
    const dropOffCode = await getDeliveryDropOffCode(page);
    const result = await completeDeliveryOrderByUuid(
      parseRegion(region),
      uuid,
      dropOffCode,
    );
    expect(result.status).toMatch(/complete/i);
  },
);
