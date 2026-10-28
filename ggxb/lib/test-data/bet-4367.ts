export type Bet4367Locale = "en-HK" | "zh-HK";

/** Crowdin key: `error_insufficient_balance_with_tip` (BET-4300 / BET-4367). */
export const bet4367InsufficientBalanceWithTip: Record<Bet4367Locale, string> =
  {
    "en-HK":
      "Insufficient balance. The rush order fee amount causes your total to exceed your wallet balance. Please adjust the rush order fee or add funds.",
    "zh-HK": "餘額不足，急單費金額導致總額超出錢包餘額，請調整急單費或增值。",
  };

/** `add_tip_courier`, `common__driver_bonus`, `button__save` in en-HK / zh-HK. */
export const bet4367TipLabels: Record<
  Bet4367Locale,
  {
    addTip: RegExp;
    modalHeader: RegExp;
    save: RegExp;
  }
> = {
  "en-HK": {
    addTip: /^Add rush order fee$/i,
    modalHeader: /^Driver rush order fee$/i,
    save: /^Save$/i,
  },
  "zh-HK": {
    addTip: /^給速遞員急單費$/,
    modalHeader: /^司機急單費$/,
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
