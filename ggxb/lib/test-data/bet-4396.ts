export type Bet4396Locale = "en-HK" | "zh-HK";

export type Bet4396Region = "discovery-bay" | "ma-wan";

export const bet4396SearchQuery: Record<
  Bet4396Region,
  Record<Bet4396Locale, string>
> = {
  "discovery-bay": {
    "en-HK": "Discovery Bay",
    "zh-HK": "愉景灣",
  },
  "ma-wan": {
    "en-HK": "Ma Wan",
    "zh-HK": "馬灣",
  },
};

export const bet4396DialogHeading: Record<
  Bet4396Region,
  Record<Bet4396Locale, RegExp>
> = {
  "discovery-bay": {
    "en-HK": /Extra fees for Discovery Bay/i,
    "zh-HK": /愉景灣額外收費/,
  },
  "ma-wan": {
    "en-HK": /Permit required for Ma Wan/i,
    "zh-HK": /進入馬灣需要禁區許可證/,
  },
};

/** Source: BET-4396 Jira comment — Crowdin keys for Discovery Bay / Ma Wan. */
export const bet4396DialogCopyLines: Record<
  Bet4396Region,
  Record<Bet4396Locale, readonly string[]>
> = {
  "discovery-bay": {
    "en-HK": [
      "All van and trucks are only permitted to enter Discovery Bay from 8am to 9pm unless authorised.",
      "Discovery Bay Tunnel toll rate:",
      "Van or 5.5 ton truck $120",
      "9 ton truck $160",
    ],
    "zh-HK": [
      "車輛限制區域，除非已獲許可，否則所有貨van及貨車只限於上午8時到下午9時出入",
      "愉景灣隧道收費：",
      "貨van或5.5噸貨車$120",
      "9噸貨車$160",
    ],
  },
  "ma-wan": {
    "en-HK": [
      "Reminder:",
      "Please note that all van and truck type vehicles are only permitted to enter Ma Wan from 10am to 4pm, unless authorized.",
    ],
    "zh-HK": [
      "溫馨提示：",
      "馬灣為車輛限制區域，貨車只限於上午10時至下午4時出入 （獲許可車輛除外）",
    ],
  },
};

export function parseBet4396Locale(locale: string): Bet4396Locale {
  if (locale !== "en-HK" && locale !== "zh-HK") {
    throw new Error(
      `Unsupported BET-4396 locale "${locale}" — use "en-HK" or "zh-HK"`,
    );
  }
  return locale;
}

export function parseBet4396Region(region: string): Bet4396Region {
  const normalized = region.trim().toLowerCase().replace(/\s+/g, "-");
  if (normalized === "discovery-bay" || normalized === "discoverybay") {
    return "discovery-bay";
  }
  if (normalized === "ma-wan" || normalized === "mawan") {
    return "ma-wan";
  }
  throw new Error(
    `Unsupported BET-4396 region "${region}" — use "Discovery Bay" or "Ma Wan"`,
  );
}
