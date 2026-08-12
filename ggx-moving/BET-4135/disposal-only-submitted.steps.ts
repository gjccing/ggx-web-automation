import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  expectMixpanelEvent,
  getCapturedMixpanelEvents,
  installMixpanelCapture,
} from "../lib/tracking/mixpanel.js";
import {
  DISPOSAL_ONLY_SUBMITTED_REQUIRED_PROPERTIES,
  DISPOSAL_SUBMIT_EXPECTED_TIME,
} from "../lib/test-data/bet-4135.js";
import { disposalWaypoint } from "../lib/test-data/order-fixture.js";

const { Given, Then } = createBdd();

Given("Mixpanel tracking is captured", async ({ page }) => {
  await installMixpanelCapture(page);
});

Then(
  "the Mixpanel event {string} should include required disposal submit properties",
  async ({ page }, eventName: string) => {
    test.setTimeout(180_000);
    try {
      const event = await expectMixpanelEvent(
        page,
        eventName,
        [...DISPOSAL_ONLY_SUBMITTED_REQUIRED_PROPERTIES],
      );

      expect(typeof event.properties.collection_location).toBe("string");
      expect(String(event.properties.collection_location)).toContain(
        disposalWaypoint.street,
      );
      expect(typeof event.properties.preferred_time).toBe("string");
      expect(event.properties.preferred_time).toBe(DISPOSAL_SUBMIT_EXPECTED_TIME);
      expect(typeof event.properties.remarks_length).toBe("number");
      expect(typeof event.properties.total_photos_uploaded).toBe("number");
      expect(typeof event.properties.total_items_counted).toBe("number");
      expect(typeof event.properties.builder_time_secs).toBe("number");
      expect(event.properties.builder_time_secs as number).toBeGreaterThanOrEqual(0);
    } catch (error) {
      const captured = getCapturedMixpanelEvents(page);
      const names = captured.map((e) => e.event);
      const disposal = captured.find((e) => e.event === "disposal_only_submitted");
      throw new Error(
        `${error instanceof Error ? error.message : String(error)}\n` +
          `Captured Mixpanel events: ${JSON.stringify(names)}\n` +
          `disposal_only_submitted props: ${JSON.stringify(disposal?.properties ?? null)}`,
      );
    }
  },
);

Then(
  "the disposal_only_submitted photo and remarks counts should match the empty extras submission",
  async ({ page }) => {
    const event = await expectMixpanelEvent(
      page,
      "disposal_only_submitted",
      [...DISPOSAL_ONLY_SUBMITTED_REQUIRED_PROPERTIES],
    );

    // Flow skips items builder + photo upload → counts should be zero.
    expect(event.properties.total_photos_uploaded).toBe(0);
    expect(event.properties.remarks_length).toBe(0);
    expect(event.properties.total_items_counted).toBe(0);
  },
);
