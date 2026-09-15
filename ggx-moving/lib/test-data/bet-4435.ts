import type { GgxMovingLocale } from "../../env.js";

/** BET-4435 — homepage T&C links on Standard moving and Special moving. */

export type Bet4435Service = "standard" | "corporate";
export type Bet4435Locale = GgxMovingLocale;

/** Confirmed copy: Jira comment on BET-4435 (`terms_and_conditions`). */
export const bet4435TncLabel: Record<Bet4435Locale, string> = {
  "en-HK": "Terms & Conditions",
  "zh-HK": "條款及細則",
};

export const bet4435TncUrl: Record<Bet4435Locale, string> = {
  "en-HK": "https://www.gogox.com/moving-tnc/",
  "zh-HK": "https://www.gogox.com/hk/moving-tnc/",
};

/** Pre-BET-4435 link copy — must not appear on the selected card. */
export const bet4435ObsoleteLinkLabels: Record<Bet4435Locale, string[]> = {
  "en-HK": ["Pricing and more info", "In-person quoting available"],
  "zh-HK": ["定價及更多資料", "可提供上門報價"],
};

export function parseBet4435Locale(locale: string): Bet4435Locale {
  if (locale !== "en-HK" && locale !== "zh-HK") {
    throw new Error(
      `Unsupported BET-4435 locale "${locale}" — use "en-HK" or "zh-HK"`,
    );
  }
  return locale;
}

export function parseBet4435Service(service: string): Bet4435Service {
  if (service !== "standard" && service !== "corporate") {
    throw new Error(
      `Unsupported BET-4435 service "${service}" — use standard or corporate`,
    );
  }
  return service;
}

export function tncHrefPattern(url: string): RegExp {
  const base = url.replace(/\/+$/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${base}/?$`);
}
