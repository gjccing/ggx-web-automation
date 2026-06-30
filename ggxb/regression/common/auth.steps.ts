import { createBdd } from "playwright-bdd";
import { loginViaUi } from "../../lib/auth.js";
import { type GgxbRegion } from "../../env.js";

const { Given } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

Given(
  "I am logged in to GGXB {string} in English",
  async ({ page }, region: string) => {
    await loginViaUi(page, parseRegion(region), { english: true });
  },
);

Given("I am logged in to GGXB {string}", async ({ page }, region: string) => {
  await loginViaUi(page, parseRegion(region), { english: false });
});
