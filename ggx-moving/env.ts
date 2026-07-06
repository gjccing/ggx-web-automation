export type GgxMovingLocale = "en-HK" | "zh-HK";

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE_URL_ENV = "GGX_MOVING_BASE_URL";
const SHEETS_ID_ENV = "GGX_MOVING_GOOGLE_SHEETS_SPREADSHEET_ID";
const SERVICE_ACCOUNT_ENV = "GGX_MOVING_GOOGLE_SERVICE_ACCOUNT_JSON_PATH";

const DEFAULT_SHEETS_ID = "11NYD0iBENFqAkah9SP9zUPA_Cm__o8mh9RQh4fIqRgY";

const productRoot = join(dirname(fileURLToPath(import.meta.url)));

export function ggxMovingBaseUrl(locale: GgxMovingLocale = "en-HK"): string {
  const fromEnv = process.env[BASE_URL_ENV];
  if (!fromEnv) {
    throw new Error(`Set ${BASE_URL_ENV} in the repo root .env file`);
  }
  const base = fromEnv.replace(/\/$/, "");
  const withLocale = base.match(/\/(en-HK|zh-HK)$/);
  if (withLocale) {
    return base.replace(/\/(en-HK|zh-HK)$/, `/${locale}`);
  }
  return `${base}/${locale}`;
}

export function ggxMovingSheetsSpreadsheetId(): string {
  return process.env[SHEETS_ID_ENV] ?? DEFAULT_SHEETS_ID;
}

export function ggxMovingGoogleServiceAccountPath(): string {
  const fromEnv = process.env[SERVICE_ACCOUNT_ENV];
  if (fromEnv) return fromEnv;
  return join(productRoot, ".secrets", "google-service-account.json");
}
