import { createBdd } from "playwright-bdd";
import { test } from "@playwright/test";
import { ggxbBet4481TestUser, type GgxbRegion } from "../env.js";
import { loginViaUi } from "../lib/auth.js";
import {
  expectFavouriteStatusUpdatedWithSuccessToast,
  favouriteAssignedDriver,
  openTransportOrderWithAssignedDriver,
} from "../lib/pages/favourite-driver.js";

const { Given, When, Then } = createBdd();

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
    test.setTimeout(120_000);
    await loginViaUi(page, parseRegion(region), {
      english: true,
      credentials: ggxbBet4481TestUser(),
    });
  },
);

When("I open a transport order that has an assigned driver", async ({ page }) => {
  await openTransportOrderWithAssignedDriver(page);
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
