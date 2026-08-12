import { expect, type Page, type Request } from "@playwright/test";

export type MixpanelEvent = {
  event: string;
  properties: Record<string, unknown>;
};

const captureByPage = new WeakMap<Page, MixpanelEvent[]>();

function tryDecodeMixpanelData(raw: string): MixpanelEvent[] {
  const candidates = [raw, decodeURIComponent(raw)];
  for (const candidate of candidates) {
    try {
      const jsonText = Buffer.from(candidate, "base64").toString("utf8");
      const decoded = JSON.parse(jsonText) as unknown;
      return normalizeDecoded(decoded);
    } catch {
      /* try next */
    }
    try {
      return normalizeDecoded(JSON.parse(candidate) as unknown);
    } catch {
      /* try next */
    }
  }
  return [];
}

function normalizeDecoded(decoded: unknown): MixpanelEvent[] {
  const items = Array.isArray(decoded) ? decoded : [decoded];
  const events: MixpanelEvent[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const record = item as { event?: unknown; properties?: unknown };
    if (typeof record.event !== "string") continue;
    events.push({
      event: record.event,
      properties:
        record.properties && typeof record.properties === "object"
          ? { ...(record.properties as Record<string, unknown>) }
          : {},
    });
  }
  return events;
}

function extractMixpanelEventsFromRequest(request: Request): MixpanelEvent[] {
  const url = request.url();
  if (!/mixpanel\.com\/(?:track|engage)/i.test(url)) return [];

  const found: MixpanelEvent[] = [];
  const u = new URL(url);
  const dataQuery = u.searchParams.get("data");
  if (dataQuery) found.push(...tryDecodeMixpanelData(dataQuery));

  const post = request.postData();
  if (post) {
    if (post.startsWith("{") || post.startsWith("[")) {
      found.push(...tryDecodeMixpanelData(post));
    } else {
      try {
        const params = new URLSearchParams(post);
        const data = params.get("data");
        if (data) found.push(...tryDecodeMixpanelData(data));
      } catch {
        found.push(...tryDecodeMixpanelData(post));
      }
    }
  }
  return found;
}

/**
 * Capture Mixpanel track payloads from network requests (works with ES module
 * imports of mixpanel-browser). Install before navigating.
 */
export async function installMixpanelCapture(page: Page): Promise<void> {
  const events: MixpanelEvent[] = [];
  captureByPage.set(page, events);

  page.on("request", (request) => {
    for (const event of extractMixpanelEventsFromRequest(request)) {
      events.push(event);
    }
  });
}

export function getCapturedMixpanelEvents(page: Page): MixpanelEvent[] {
  return captureByPage.get(page) ?? [];
}

export async function expectMixpanelEvent(
  page: Page,
  eventName: string,
  requiredProperties: string[],
): Promise<MixpanelEvent> {
  let matched: MixpanelEvent | undefined;
  await expect
    .poll(
      () => {
        const events = getCapturedMixpanelEvents(page);
        matched = [...events].reverse().find((e) => e.event === eventName);
        return matched;
      },
      { timeout: 20_000 },
    )
    .toBeTruthy();

  expect(matched, `Mixpanel event "${eventName}"`).toBeTruthy();
  for (const key of requiredProperties) {
    expect(
      matched!.properties,
      `property "${key}" on ${eventName}`,
    ).toHaveProperty(key);
  }
  return matched!;
}
