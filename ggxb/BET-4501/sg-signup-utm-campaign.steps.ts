import { createBdd } from "playwright-bdd";
import { openLoginPage } from "../lib/auth.js";
import { expectSignUpLinkParam, type SignUpUtmParam } from "../lib/pages/login.js";
import { type GgxbRegion } from "../env.js";

const { Given, Then } = createBdd();

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

function parseUtmParam(name: string): SignUpUtmParam {
  if (name !== "utm_source" && name !== "utm_medium" && name !== "utm_campaign") {
    throw new Error(`Unsupported sign-up utm parameter "${name}"`);
  }
  return name;
}

Given(
  "I open the GGXB {string} login page with utm parameters {string}",
  async ({ page }, region: string, query: string) => {
    await openLoginPage(page, parseRegion(region), query);
  },
);

Then(
  "the sign-up link {word} should be {string}",
  async ({ page }, name: string, value: string) => {
    await expectSignUpLinkParam(page, parseUtmParam(name), value);
  },
);
