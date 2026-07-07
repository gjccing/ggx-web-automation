export type Bet4376Locale = "en-HK" | "zh-HK";

export const bet4376AirportSearchQuery: Record<Bet4376Locale, string> = {
  "en-HK": "Hong Kong International Airport",
  "zh-HK": "香港國際機場",
};

export const bet4376DialogHeading: Record<Bet4376Locale, RegExp> = {
  "en-HK": /Extra fees for HK International Airport/i,
  "zh-HK": /香港國際機場額外收費/,
};

/** Source: BET-4376 — Crowdin key `dialog__description__extra_fee_hk_international_airport` (zh-HK). */
export const bet4376UpdatedZhFeeLines = [
  "輕型貨車時租停車場(機場世貿旁) 每小時$16",
  "輕型貨車上落貨區(T1旁) 首30分鐘$50",
] as const;

/** Pre-BET-4376 zh-HK fee wording — must not appear in the dialog fee section. */
export const bet4376ObsoleteZhFeeFragments = [
  "貨Van及貨車時租停車場",
  "貨Van及貨車上落貨區",
] as const;

/** en-HK copy unchanged by BET-4376. */
export const bet4376EnFeeLines = [
  "Hourly parking area (next to AWTC) $16/hour",
  "Loading/unloading area (next to T1) $50/first 30min",
] as const;

export function parseBet4376Locale(locale: string): Bet4376Locale {
  if (locale !== "en-HK" && locale !== "zh-HK") {
    throw new Error(
      `Unsupported BET-4376 locale "${locale}" — use "en-HK" or "zh-HK"`,
    );
  }
  return locale;
}
