import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { type GgxbRegion } from "../env.js";
import { acceptDeliveryOrderByTid } from "../lib/api/da/delivery.js";
import {
  cancelAcceptedDeliveryOrderExpectInstruction,
  getDeliveryOrderId,
  getDeliveryOrderStatus,
  reopenDeliveryOrderByTid,
} from "../lib/pages/delivery-order-management.js";

const { When, Then } = createBdd();

/** Merchant tid from the last placed / reopened delivery order. */
let lastDeliveryTid: string | undefined;
/** Message captured from the cancellation-instruction dialog. */
let lastCancelInstructionMessage: string | undefined;

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

When(
  "a courier accepts the current delivery order via DA API for {string}",
  async ({ page }, region: string) => {
    test.setTimeout(180_000);
    const tid = await getDeliveryOrderId(page);
    lastDeliveryTid = tid;
    const result = await acceptDeliveryOrderByTid(parseRegion(region), tid);
    expect(result.status).toMatch(/accept/i);
  },
);

When(
  "I reopen the current delivery order to confirm courier acceptance in {string}",
  async ({ page }, region: string) => {
    const tid = lastDeliveryTid ?? (await getDeliveryOrderId(page));
    lastDeliveryTid = tid;
    await reopenDeliveryOrderByTid(page, parseRegion(region), tid);
  },
);

Then(
  "the delivery order status should match {string}",
  async ({ page }, pattern: string) => {
    const status = await getDeliveryOrderStatus(page);
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
  expect(status).not.toMatch(/Order cancelled|訂單已取消|已取消/i);
  expect(status).toMatch(/Accepted|接單|courier|driver/i);
});
