import { existsSync, readFileSync } from "node:fs";
import { google } from "googleapis";
import { test } from "@playwright/test";
import {
  ggxMovingGoogleServiceAccountPath,
  ggxMovingSheetsSheetName,
  ggxMovingSheetsSpreadsheetId,
} from "../../env.js";
import FIELD_HEADERS from "./moving-order-field-headers.json" with { type: "json" };

export type SheetOrderRow = {
  service: string;
  orderId: string;
  createdAt: string;
  fromAddress: string;
  toAddress: string;
  /** Google Drive folder URL written when photos were attached (header 相). */
  photosFolderUrl: string;
  contactName: string;
  phone: string;
  email: string;
  utmMedium: string;
  utmSource: string;
  utmCampaign: string;
  utmContent: string;
  utmChannel: string;
  /** Header row used to resolve values (for assertions after column moves). */
  headers: string[];
  raw: string[];
};

type SheetsClient = ReturnType<typeof google.sheets>;

type PendingColumnSwap = {
  headerA: string;
  headerB: string;
};

let pendingColumnSwap: PendingColumnSwap | null = null;

function loadSheetsClient(write = false): SheetsClient {
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
    scopes: [
      write
        ? "https://www.googleapis.com/auth/spreadsheets"
        : "https://www.googleapis.com/auth/spreadsheets.readonly",
    ],
  });
  return google.sheets({ version: "v4", auth });
}

/**
 * Resolve the orders tab the same way as gogox-moving (`getSheetNameByGid(0)`).
 * Bare ranges like `A:AZ` follow tab *index* order, which can be a decoy sheet
 * (e.g. Sheet5) placed before the real gid-0 Sheet1.
 */
async function resolveOrdersSheet(
  sheets: SheetsClient,
  spreadsheetId: string,
): Promise<{ title: string; sheetId: number }> {
  const configured = ggxMovingSheetsSheetName();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const byGid = meta.data.sheets?.find((s) => s.properties?.sheetId === 0);
  if (configured) {
    const byTitle = meta.data.sheets?.find(
      (s) => s.properties?.title === configured,
    );
    const sheetId = byTitle?.properties?.sheetId;
    if (sheetId == null) {
      throw new Error(
        `Configured sheet "${configured}" not found in spreadsheet ${spreadsheetId}`,
      );
    }
    return { title: configured, sheetId };
  }

  const title = byGid?.properties?.title;
  const sheetId = byGid?.properties?.sheetId;
  if (!title || sheetId == null) {
    throw new Error(
      `No sheet with gid 0 in spreadsheet ${spreadsheetId}. ` +
        `Set GGX_MOVING_GOOGLE_SHEETS_SHEET_NAME explicitly.`,
    );
  }
  return { title, sheetId };
}

function quotedSheetRange(title: string, a1: string): string {
  return `'${title.replace(/'/g, "''")}'!${a1}`;
}

function defaultIndexForHeader(header: string): number {
  return (FIELD_HEADERS as string[]).indexOf(header);
}

function cellByHeader(
  row: string[],
  headers: string[],
  header: string,
): string {
  const byName = headers.indexOf(header);
  const index = byName >= 0 ? byName : defaultIndexForHeader(header);
  if (index < 0) return "";
  return row[index] ?? "";
}

function mapSheetRow(row: string[], headers: string[]): SheetOrderRow {
  return {
    service: cellByHeader(row, headers, "service"),
    orderId: cellByHeader(row, headers, "lead_id"),
    createdAt: cellByHeader(row, headers, "created_at"),
    fromAddress: cellByHeader(row, headers, "起點"),
    toAddress: cellByHeader(row, headers, "終點"),
    photosFolderUrl: cellByHeader(row, headers, "相"),
    contactName: cellByHeader(row, headers, "contact_name"),
    phone: cellByHeader(row, headers, "whatsapp_phone_number"),
    email: cellByHeader(row, headers, "email"),
    utmMedium: cellByHeader(row, headers, "utm_medium"),
    utmSource: cellByHeader(row, headers, "utm_source"),
    utmCampaign: cellByHeader(row, headers, "utm_campaign"),
    utmContent: cellByHeader(row, headers, "utm_content"),
    utmChannel: cellByHeader(row, headers, "Acquisition Channel"),
    headers,
    raw: row,
  };
}

export async function fetchOrderRowByOrderId(
  orderId: string,
  retries = 8,
  delayMs = 2_000,
): Promise<SheetOrderRow> {
  const sheets = loadSheetsClient(false);
  const spreadsheetId = ggxMovingSheetsSpreadsheetId();
  const { title } = await resolveOrdersSheet(sheets, spreadsheetId);
  const range = quotedSheetRange(title, "A:AZ");

  for (let attempt = 0; attempt < retries; attempt += 1) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = response.data.values ?? [];
    const headers = (rows[0] ?? []).map((cell) => String(cell ?? ""));
    const leadIdx = (() => {
      const byName = headers.indexOf("lead_id");
      return byName >= 0 ? byName : 1;
    })();
    const match = [...rows]
      .slice(1)
      .reverse()
      .find((row) => (row[leadIdx] ?? "") === orderId);
    if (match) {
      return mapSheetRow(match.map((cell) => String(cell ?? "")), headers);
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(
    `Order ${orderId} not found in spreadsheet ${spreadsheetId} (sheet ${title})`,
  );
}

/**
 * Delete every Moving Orders row whose lead_id matches `orderId`.
 * Deletes bottom-up so row indices stay valid. Returns how many rows were removed.
 */
export async function deleteOrderRowsByOrderId(orderId: string): Promise<number> {
  if (!orderId) return 0;

  const sheets = loadSheetsClient(true);
  const spreadsheetId = ggxMovingSheetsSpreadsheetId();
  const { title, sheetId } = await resolveOrdersSheet(sheets, spreadsheetId);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: quotedSheetRange(title, "A:AZ"),
  });
  const rows = response.data.values ?? [];
  const headers = (rows[0] ?? []).map((cell) => String(cell ?? ""));
  const leadIdx = (() => {
    const byName = headers.indexOf("lead_id");
    return byName >= 0 ? byName : 1;
  })();

  // values[i] is sheet row i (0-based); header is row 0.
  const rowIndexes: number[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    if (String(rows[i]?.[leadIdx] ?? "") === orderId) {
      rowIndexes.push(i);
    }
  }
  if (rowIndexes.length === 0) return 0;

  rowIndexes.sort((a, b) => b - a);
  for (const startIndex of rowIndexes) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex,
                endIndex: startIndex + 1,
              },
            },
          },
        ],
      },
    });
  }
  return rowIndexes.length;
}

/** Fail fast when sheet layout mutations could race other sheet tests. */
export function assertSingleWorkerForSheetMutation(): void {
  const workers = test.info().config.workers;
  if (workers !== 1) {
    throw new Error(
      `Sheet column mutation requires Playwright workers=1 (got ${workers}). ` +
        "Do not run @exclusive-sheet scenarios in parallel with other sheet tests.",
    );
  }
}

export function pendingOrderSheetColumnSwap(): PendingColumnSwap | null {
  return pendingColumnSwap;
}

async function readHeaderRow(
  sheets: SheetsClient,
  spreadsheetId: string,
  title: string,
): Promise<string[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: quotedSheetRange(title, "1:1"),
  });
  return (response.data.values?.[0] ?? []).map((cell) => String(cell ?? ""));
}

async function moveColumnsSwapByCurrentIndices(
  sheets: SheetsClient,
  spreadsheetId: string,
  sheetId: number,
  indexLeft: number,
  indexRight: number,
): Promise<void> {
  let i = indexLeft;
  let j = indexRight;
  if (i === j) return;
  if (i > j) [i, j] = [j, i];

  // Move j → i, then original i (now i+1) → j+1.
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          moveDimension: {
            source: {
              sheetId,
              dimension: "COLUMNS",
              startIndex: j,
              endIndex: j + 1,
            },
            destinationIndex: i,
          },
        },
      ],
    },
  });
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          moveDimension: {
            source: {
              sheetId,
              dimension: "COLUMNS",
              startIndex: i + 1,
              endIndex: i + 2,
            },
            destinationIndex: j + 1,
          },
        },
      ],
    },
  });
}

/**
 * Swap two columns (header + all data) by header name.
 * Used to verify the app resolves write targets by name, not fixed index.
 */
export async function swapOrderSheetColumnsByHeader(
  headerA: string,
  headerB: string,
): Promise<{ indexA: number; indexB: number }> {
  if (pendingColumnSwap) {
    throw new Error(
      `Cannot swap columns while a previous swap is still pending: ` +
        `${pendingColumnSwap.headerA} ↔ ${pendingColumnSwap.headerB}`,
    );
  }
  if (headerA === headerB) {
    throw new Error("Cannot swap a column with itself");
  }

  const sheets = loadSheetsClient(true);
  const spreadsheetId = ggxMovingSheetsSpreadsheetId();
  const { title, sheetId } = await resolveOrdersSheet(sheets, spreadsheetId);
  const headers = await readHeaderRow(sheets, spreadsheetId, title);
  const i = headers.indexOf(headerA);
  const j = headers.indexOf(headerB);
  if (i < 0 || j < 0) {
    throw new Error(
      `Cannot swap missing headers "${headerA}" (${i}) / "${headerB}" (${j}) ` +
        `on sheet ${title}`,
    );
  }

  await moveColumnsSwapByCurrentIndices(sheets, spreadsheetId, sheetId, i, j);

  const after = await readHeaderRow(sheets, spreadsheetId, title);
  const indexA = after.indexOf(headerA);
  const indexB = after.indexOf(headerB);
  if (indexA < 0 || indexB < 0 || indexA === indexB) {
    throw new Error(
      `Column swap did not relocate headers "${headerA}" / "${headerB}"`,
    );
  }

  pendingColumnSwap = { headerA, headerB };
  return { indexA, indexB };
}

/** Restore a previous {@link swapOrderSheetColumnsByHeader} (no-op if none pending). */
export async function restorePendingOrderSheetColumnSwap(): Promise<void> {
  if (!pendingColumnSwap) return;

  const { headerA, headerB } = pendingColumnSwap;
  const sheets = loadSheetsClient(true);
  const spreadsheetId = ggxMovingSheetsSpreadsheetId();
  const { title, sheetId } = await resolveOrdersSheet(sheets, spreadsheetId);
  const headers = await readHeaderRow(sheets, spreadsheetId, title);
  const i = headers.indexOf(headerA);
  const j = headers.indexOf(headerB);
  if (i < 0 || j < 0) {
    throw new Error(
      `Cannot restore swap; headers missing: "${headerA}" (${i}) / "${headerB}" (${j})`,
    );
  }

  await moveColumnsSwapByCurrentIndices(sheets, spreadsheetId, sheetId, i, j);
  pendingColumnSwap = null;
}

/** Fixed (canonical) indices from the seeded header list — for proving a reorder happened. */
export function canonicalHeaderIndex(header: string): number {
  return defaultIndexForHeader(header);
}
