export type Bet4394Locale = "en-HK" | "zh-HK";

export function parseBet4394Locale(locale: string): Bet4394Locale {
  if (locale !== "en-HK" && locale !== "zh-HK") {
    throw new Error(
      `Unsupported BET-4394 locale "${locale}" — use "en-HK" or "zh-HK"`,
    );
  }
  return locale;
}
