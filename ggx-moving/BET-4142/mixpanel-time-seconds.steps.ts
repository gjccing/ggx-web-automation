import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { fillWaypoint } from "../lib/pages/address-picker.js";
import { movingLabels } from "../lib/labels.js";
import { stdMovingWaypoints } from "../lib/test-data/order-fixture.js";
import {
  ADDRESS_POPUP_CONFIRMED_EVENT,
  ADDRESS_POPUP_CONFIRMED_REQUIRED_PROPERTIES,
  MOVING_FORM_SUBMITTED_EVENT,
  MOVING_FORM_SUBMITTED_REQUIRED_PROPERTIES,
  POPUP_TIME_SECS_PROPERTY,
  TIME_TO_SUBMIT_PROPERTY,
} from "../lib/test-data/bet-4142.js";
import {
  expectDurationInSeconds,
  expectMixpanelEvent,
  expectUnixTimestampSeconds,
  getCapturedMixpanelEvents,
} from "../lib/tracking/mixpanel.js";

const { When, Then } = createBdd();

/** Wall-clock span of the last timed action (From waypoint confirm). */
let lastTimedActionMs = 0;

When("I confirm the From waypoint address popup", async ({ page }) => {
  const startedAt = Date.now();
  await fillWaypoint(page, movingLabels.from, stdMovingWaypoints.from);
  lastTimedActionMs = Date.now() - startedAt;
});

Then(
  "the Mixpanel event {string} should report {string} in seconds",
  async ({ page }, eventName: string, propertyName: string) => {
    expect(eventName).toBe(ADDRESS_POPUP_CONFIRMED_EVENT);
    expect(propertyName).toBe(POPUP_TIME_SECS_PROPERTY);

    try {
      const event = await expectMixpanelEvent(page, eventName, [
        ...ADDRESS_POPUP_CONFIRMED_REQUIRED_PROPERTIES,
      ]);
      expectDurationInSeconds(event.properties[propertyName], propertyName, {
        elapsedMs: lastTimedActionMs,
      });
    } catch (error) {
      rethrowWithCapturedEvents(page, eventName, error);
    }
  },
);

Then(
  "the Mixpanel event {string} should report {string} as a Unix timestamp in seconds",
  async ({ page }, eventName: string, propertyName: string) => {
    expect(eventName).toBe(MOVING_FORM_SUBMITTED_EVENT);
    expect(propertyName).toBe(TIME_TO_SUBMIT_PROPERTY);
    test.setTimeout(180_000);

    try {
      const event = await expectMixpanelEvent(page, eventName, [
        ...MOVING_FORM_SUBMITTED_REQUIRED_PROPERTIES,
      ]);
      expectUnixTimestampSeconds(event.properties[propertyName], propertyName);
    } catch (error) {
      rethrowWithCapturedEvents(page, eventName, error);
    }
  },
);

function rethrowWithCapturedEvents(
  page: import("@playwright/test").Page,
  eventName: string,
  error: unknown,
): never {
  const captured = getCapturedMixpanelEvents(page);
  const names = captured.map((e) => e.event);
  const matched = captured.find((e) => e.event === eventName);
  throw new Error(
    `${error instanceof Error ? error.message : String(error)}\n` +
      `Captured Mixpanel events: ${JSON.stringify(names)}\n` +
      `${eventName} props: ${JSON.stringify(matched?.properties ?? null)}`,
  );
}
