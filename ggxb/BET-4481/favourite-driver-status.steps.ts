import { createBdd } from "playwright-bdd";
import { expect, test } from "@playwright/test";
import { ggxbBet4481TestUser, type GgxbRegion } from "../env.js";
import { acceptTransportOrderToActive } from "../lib/api/da/transport.js";
import { loginViaUi } from "../lib/auth.js";
import {
  expectFavouriteStatusUpdatedWithSuccessToast,
  favouriteAssignedDriver,
  openTransportOrderByNid,
} from "../lib/pages/favourite-driver.js";
import { readTransportOrderIdentity } from "../lib/pages/transport-order-management.js";

const { Given, When, Then } = createBdd();

/** Public nid of the order this scenario placed and assigned. */
let lastTransportNid: string | undefined;

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

Given(
  "I am logged in to GGXB {string} as the BET-4481 test user in English",
  async ({ page }, region: string) => {
    test.setTimeout(300_000);
    await loginViaUi(page, parseRegion(region), {
      english: true,
      credentials: ggxbBet4481TestUser(),
    });
  },
);

When(
  "a transport driver accepts the current transport order to active for {string}",
  async ({ page }, region: string) => {
    test.setTimeout(300_000);
    const identity = await readTransportOrderIdentity(page);
    lastTransportNid = identity.nid;
    const result = await acceptTransportOrderToActive(parseRegion(region), {
      id: identity.id,
      uuid: identity.uuid,
    });
    expect(result.status).toBe("active");
  },
);

When("I open that transport order", async ({ page }) => {
  const nid = lastTransportNid;
  if (!nid) {
    throw new Error(
      "Missing transport order id — place and accept the order first",
    );
  }
  await openTransportOrderByNid(page, nid);
});

When("I favourite that assigned driver", async ({ page }) => {
  await favouriteAssignedDriver(page);
});

Then(
  "the driver favourite status is already updated when the favourited success message is shown",
  async ({ page }) => {
    await expectFavouriteStatusUpdatedWithSuccessToast();
  },
);
