export type Bet4379Locale = "en-HK" | "zh-HK";

/** Source: BET-4379 — Crowdin key `std_moving__body1`. */
export const bet4379StandardMovingBody1: Record<Bet4379Locale, string> = {
  "en-HK": "Includes transportation and packing of household items",
  "zh-HK": "包括家居物品運送及打包",
};

/** Pre-BET-4379 quantity wording — must not appear in body1. */
export const bet4379ObsoleteQuantityPatterns: Record<Bet4379Locale, RegExp[]> =
  {
    "en-HK": [
      /\d+\s*-\s*\d+\s*movers/i,
      /\d+\s*boxes/i,
      /\d+\s*-\s*\d+\s*large items/i,
    ],
    "zh-HK": [/\d+\s*-\s*\d+名搬運/, /\d+個箱/, /\d+\s*-\s*\d+件/],
  };

export function parseBet4379Locale(locale: string): Bet4379Locale {
  if (locale !== "en-HK" && locale !== "zh-HK") {
    throw new Error(
      `Unsupported BET-4379 locale "${locale}" — use "en-HK" or "zh-HK"`,
    );
  }
  return locale;
}

export function normalizeBody1Text(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
