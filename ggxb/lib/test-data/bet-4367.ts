export type Bet4367Locale = "en-HK" | "zh-HK";

/** Crowdin key: `error_insufficient_balance_with_tip` (BET-4300 / BET-4367). */
export const bet4367InsufficientBalanceWithTip: Record<Bet4367Locale, string> =
  {
    "en-HK":
      "Insufficient balance. The tip amount causes your total to exceed your wallet balance. Please adjust the tip or add funds.",
    "zh-HK": "餘額不足，貼士金額導致總額超出錢包餘額，請調整貼士或增值。",
  };

export const bet4367TipLabels: Record<
  Bet4367Locale,
  {
    addTip: RegExp;
    modalHeader: RegExp;
    save: RegExp;
  }
> = {
  "en-HK": {
    addTip: /^Add tip$/i,
    modalHeader: /^Driver tip$/i,
    save: /^Save$/i,
  },
  "zh-HK": {
    addTip: /^給速遞員貼士$/,
    modalHeader: /^司機急車費$/,
    save: /^儲存$/,
  },
};

export function parseBet4367Locale(locale: string): Bet4367Locale {
  if (locale !== "en-HK" && locale !== "zh-HK") {
    throw new Error(
      `Unsupported BET-4367 locale "${locale}" — use "en-HK" or "zh-HK"`,
    );
  }
  return locale;
}
