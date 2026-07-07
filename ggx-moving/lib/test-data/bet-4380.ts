export type Bet4380Locale = "en-HK" | "zh-HK";

/**
 * BET-4380 — updated "Distance from parking to door" (離泊車位距離) option list.
 * Source: Jira BET-4380 requirements + Crowdin keys
 *   distance__on_premises_parking (create), distance__50_or_less (update),
 *   distance__over_100 (create). "51-100 m" is retained from the existing list.
 * Ordered by increasing distance, matching the proposed option set.
 */
export const bet4380CarryDistanceOptions: Record<Bet4380Locale, string[]> = {
  "en-HK": ["On-premises parking", "50 m or less", "51-100 m", "more than 100 m"],
  "zh-HK": ["物業泊車", "50米或以下", "51-100米", "100米以上"],
};

/** Pre-BET-4380 options that must no longer appear once the list is updated. */
export const bet4380RemovedCarryDistanceOptions: Record<Bet4380Locale, string[]> = {
  "en-HK": ["No walking needed", "101-150 m", "151-200 m"],
  "zh-HK": ["不需步行", "50米或更少", "101-150米", "151-200米"],
};

export function parseBet4380Locale(locale: string): Bet4380Locale {
  if (locale !== "en-HK" && locale !== "zh-HK") {
    throw new Error(
      `Unsupported BET-4380 locale "${locale}" — use "en-HK" or "zh-HK"`,
    );
  }
  return locale;
}

export function normalizeOptionLabel(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
