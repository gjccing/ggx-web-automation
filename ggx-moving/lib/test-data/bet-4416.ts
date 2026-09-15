import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

/** 4,803,511 bytes (4.581 MiB) — above `MAX_FILE_SIZE` of 4.5 * 1024 * 1024. */
export const bet4416OverLimitPhotoPath = join(
  fixturesDir,
  "bet-4416-over-limit.png",
);

/** Exactly 4,500,000 bytes (4.5 decimal MB) — at the stated max, under 4.5 MiB. */
export const bet4416MaxSupportedPhotoPath = join(
  fixturesDir,
  "bet-4416-4.5mb-decimal.jpg",
);

export const bet4416MaxSizeDialogTitle = /^Files are too large$|^檔案太大$/;
export const bet4416MaxSizeDialogBody =
  /Maximum file size is 4\.5MB|檔案大小限制為 4\.5MB/;
