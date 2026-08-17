import { test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  expectAdditionalChargeRow,
  expectTransactionTypeOption,
  filterTransactionHistoryByType,
  navigateToTransactionHistory,
  setTransactionHistoryDateRange,
} from "../lib/pages/transaction-history.js";
import { BET4179 } from "../lib/test-data/bet-4179.js";

const { When, Then } = createBdd();

When("I open the GGXB transaction history page", async ({ page }) => {
  test.setTimeout(180_000);
  await navigateToTransactionHistory(page, "hk");
});

When(
  "I set the transaction history date range from {string} to {string}",
  async ({ page }, start: string, end: string) => {
    await setTransactionHistoryDateRange(page, start, end);
  },
);

Then(
  "the transaction type filter should include {string}",
  async ({ page }, optionLabel: string) => {
    await expectTransactionTypeOption(page, optionLabel);
  },
);

When(
  "I filter transaction history by type {string}",
  async ({ page }, optionLabel: string) => {
    const value =
      optionLabel === BET4179.transactionTypeLabel
        ? BET4179.transactionTypeValue
        : optionLabel;
    await filterTransactionHistoryByType(page, optionLabel, value);
  },
);

Then(
  "the transaction history should show order {string} as {string} dated {string}",
  async (
    { page },
    orderIdDisplay: string,
    typeLabel: string,
    dateLabel: string,
  ) => {
    await expectAdditionalChargeRow(
      page,
      orderIdDisplay,
      typeLabel,
      dateLabel,
    );
  },
);
