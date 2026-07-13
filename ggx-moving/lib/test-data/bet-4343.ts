import type { GgxMovingLocale } from "../../env.js";

/**
 * BET-4343 — "Packing into cartons" (紙箱打包) keeps the checkbox but drops
 * the appended free-text description field.
 */
export const bet4343PackingOptionLabel: Record<GgxMovingLocale, RegExp> = {
  "en-HK": /^Packing into cartons$/,
  "zh-HK": /^紙箱打包$/,
};

/** Pre-BET-4343 description field labels that must not appear once selected. */
export const bet4343PackingDescriptionField: Record<GgxMovingLocale, RegExp> = {
  "en-HK": /^What to pack\?$/,
  "zh-HK": /^需要打包什麼？$/,
};
