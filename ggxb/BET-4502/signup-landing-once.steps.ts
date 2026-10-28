import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { ggxbBaseUrl, type GgxbRegion } from "../env.js";

const { When, Then } = createBdd();

const BET_4502_UTM = {
  utm_source: "bet4502",
  utm_medium: "e2e",
  utm_campaign: "signup-once",
} as const;

type MixpanelEvent = {
  event?: string;
  properties?: Record<string, unknown>;
};

const signUpLandingEvents: MixpanelEvent[] = [];

function parseRegion(region: string): GgxbRegion {
  const normalized = region.toLowerCase();
  if (normalized !== "hk" && normalized !== "sg") {
    throw new Error(`Unsupported GGXB region "${region}" — use "hk" or "sg"`);
  }
  return normalized;
}

function decodeMixpanelEvents(raw: string | null): MixpanelEvent[] {
  if (!raw) return [];
  const match = raw.match(/(?:^|&)data=([^&]+)/);
  if (!match) return [];
  try {
    const decoded = decodeURIComponent(match[1].replace(/\+/g, " "));
    const parsed = JSON.parse(decoded) as MixpanelEvent | MixpanelEvent[];
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

When(
  "I open the GGXB {string} signup page with UTM parameters for BET-4502",
  async ({ page }, region: string) => {
    signUpLandingEvents.length = 0;
    const parsedRegion = parseRegion(region);
    const base = ggxbBaseUrl(parsedRegion).replace(/\/$/, "");
    const params = new URLSearchParams(BET_4502_UTM);

    page.on("request", (request) => {
      if (!request.url().includes("api-js.mixpanel.com/track")) return;
      for (const item of decodeMixpanelEvents(request.postData())) {
        if (item.event === "sign up landing") signUpLandingEvents.push(item);
      }
    });

    const response = await page.goto(`${base}/signup?${params.toString()}`, {
      waitUntil: "domcontentloaded",
    });
    expect(response, "navigation should return a response").not.toBeNull();
    expect(response!.ok(), "signup page should return HTTP 2xx").toBeTruthy();

    await expect
      .poll(() => signUpLandingEvents.length, {
        timeout: 15_000,
        message: "expected a sign up landing Mixpanel event",
      })
      .toBeGreaterThan(0);
    // The duplicate is sent in the same second as the first event.
    await page.waitForTimeout(2_000);
  },
);

Then(
  "exactly one sign up landing Mixpanel event is recorded",
  async () => {
    expect(signUpLandingEvents).toHaveLength(1);
  },
);

Then(
  "the sign up landing event includes previous_page and the BET-4502 UTM super properties",
  async () => {
    const properties = signUpLandingEvents[0]?.properties ?? {};
    expect(properties.previous_page).toEqual(expect.any(String));
    expect(String(properties.previous_page).length).toBeGreaterThan(0);
    expect(properties.utm_source_last_touch).toBe(BET_4502_UTM.utm_source);
    expect(properties.utm_medium_last_touch).toBe(BET_4502_UTM.utm_medium);
    expect(properties.utm_campaign_last_touch).toBe(BET_4502_UTM.utm_campaign);
  },
);
