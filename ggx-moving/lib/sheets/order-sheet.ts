import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "googleapis";
import {
  ggxMovingGoogleServiceAccountPath,
  ggxMovingSheetsSpreadsheetId,
} from "../../env.js";

export type SheetOrderRow = {
  service: string;
  orderId: string;
  createdAt: string;
  fromAddress: string;
  toAddress: string;
  contactName: string;
  phone: string;
  email: string;
  utmMedium: string;
  utmSource: string;
  utmCampaign: string;
  utmContent: string;
  utmChannel: string;
  raw: string[];
};

function loadSheetsClient() {
  const credentialsPath = ggxMovingGoogleServiceAccountPath();
  if (!existsSync(credentialsPath)) {
    throw new Error(
      `Google service account JSON not found at ${credentialsPath}. ` +
        "Set GGX_MOVING_GOOGLE_SERVICE_ACCOUNT_JSON_PATH in .env",
    );
  }
  const credentials = JSON.parse(readFileSync(credentialsPath, "utf8"));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function fetchOrderRowByOrderId(
  orderId: string,
  retries = 8,
  delayMs = 2_000,
): Promise<SheetOrderRow> {
  const sheets = loadSheetsClient();
  const spreadsheetId = ggxMovingSheetsSpreadsheetId();

  for (let attempt = 0; attempt < retries; attempt += 1) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A:AZ",
    });
    const rows = response.data.values ?? [];
    const match = [...rows].reverse().find((row) => row[1] === orderId);
    if (match) {
      return mapSheetRow(match);
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(`Order ${orderId} not found in spreadsheet ${spreadsheetId}`);
}

function mapSheetRow(row: string[]): SheetOrderRow {
  return {
    service: row[0] ?? "",
    orderId: row[1] ?? "",
    createdAt: row[2] ?? "",
    fromAddress: row[3] ?? "",
    toAddress: row[9] ?? "",
    contactName: row[24] ?? "",
    phone: row[25] ?? "",
    email: row[26] ?? "",
    utmMedium: row[27] ?? "",
    utmSource: row[28] ?? "",
    utmCampaign: row[29] ?? "",
    utmContent: row[30] ?? "",
    utmChannel: row[31] ?? "",
    raw: row,
  };
}
