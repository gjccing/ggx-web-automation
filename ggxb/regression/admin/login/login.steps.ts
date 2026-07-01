import { createBdd } from "playwright-bdd";
import {
  expectAuthenticatedAdminLanding,
  logInAsAdminUser,
  openAdminLoginPage,
} from "../../../lib/admin/auth.js";
import { type GgxbRegion } from "../../../env.js";

const { Given, When, Then } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

Given(
  "I am on the GGXB {string} admin login page",
  async ({ page }, region: string) => {
    await openAdminLoginPage(page, parseRegion(region));
  },
);

When(
  "I log in with valid {string} admin credentials",
  async ({ page }, region: string) => {
    await logInAsAdminUser(page, parseRegion(region));
  },
);

Then("I should be on an authenticated admin panel page", async ({ page }) => {
  await expectAuthenticatedAdminLanding(page);
});
