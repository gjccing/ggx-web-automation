import { createBdd } from "playwright-bdd";
import {
  expectAuthenticatedLanding,
  logInAsMasterUser,
  openLoginPage,
  switchToEnglishIfAvailable,
} from "../../lib/auth.js";
import { type GgxbRegion } from "../../env.js";

const { Given, When, Then } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

Given(
  "I am on the GGXB {string} login page in English",
  async ({ page }, region: string) => {
    await openLoginPage(page, parseRegion(region));
    await switchToEnglishIfAvailable(page);
  },
);

Given("I am on the GGXB {string} login page", async ({ page }, region: string) => {
  await openLoginPage(page, parseRegion(region));
});

When(
  "I log in with valid {string} master user credentials",
  async ({ page }, region: string) => {
    await logInAsMasterUser(page, parseRegion(region));
  },
);

Then("I should be on an authenticated GGXB page", async ({ page }) => {
  await expectAuthenticatedLanding(page);
});
