import { createBdd } from "playwright-bdd";
import { loginAdminViaUi } from "../../../lib/admin/auth.js";
import { type GgxbRegion } from "../../../env.js";

const { Given } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

Given(
  "I am logged in to the GGXB {string} admin panel",
  async ({ page }, region: string) => {
    await loginAdminViaUi(page, parseRegion(region));
  },
);
