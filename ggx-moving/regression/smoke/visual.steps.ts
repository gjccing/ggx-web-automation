import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { movingLabels } from "../../lib/labels.js";
import {
  disposalWaypoint,
  stdMovingWaypoints,
} from "../../lib/test-data/order-fixture.js";
import { fillWaypoint } from "../../lib/pages/address-picker.js";
import {
  confirmDiscardTextDialog,
  manualItemsTextbox,
  switchToManualItemList,
} from "../../lib/pages/items-to-move.js";
import {
  clickWizardNext,
  fillMoveDetailsStep,
  selectMoveTime,
} from "../../lib/pages/wizard.js";
import { expectUiSnapshot } from "../../lib/visual.js";

const { When, Then } = createBdd();

Then(
  "the UI snapshot {string} should match",
  async ({ page }, name: string) => {
    await expectUiSnapshot(page, name);
  },
);

Then("the van rental download app dialog should be visible", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: movingLabels.downloadDialogTitle }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: movingLabels.downloadApp }),
  ).toBeVisible();
});

When(
  "I fill the standard moving move details without continuing",
  async ({ page }) => {
    test.setTimeout(120_000);
    await fillMoveDetailsStep(
      page,
      stdMovingWaypoints.from,
      stdMovingWaypoints.to,
    );
  },
);

When("I fill the disposal move details without continuing", async ({ page }) => {
  test.setTimeout(120_000);
  await fillWaypoint(page, movingLabels.from, disposalWaypoint);
  await selectMoveTime(page);
});

When("I continue to the next wizard step", async ({ page }) => {
  await clickWizardNext(page);
});

When("I open the From waypoint field", async ({ page }) => {
  await page.getByRole("button", { name: movingLabels.from, exact: true }).click();
});

Then("the WaypointField dialog should be visible", async ({ page }) => {
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("textbox", { name: movingLabels.streetAddress }),
  ).toBeVisible({ timeout: 15_000 });
});

When("I dismiss the WaypointField dialog", async ({ page }) => {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 10_000 });
});

When("I open the items-to-move fullscreen manual list", async ({ page }) => {
  await switchToManualItemList(page);
});

When("I leave the items-to-move fullscreen manual list", async ({ page }) => {
  // Empty manual list → "Select from list" returns to the picker without a discard dialog.
  await page.getByRole("button", { name: movingLabels.selectFromList }).click();
  if (await page.getByRole("heading", { name: movingLabels.discardTextContent }).isVisible().catch(() => false)) {
    await confirmDiscardTextDialog(page);
  }
  await expect(manualItemsTextbox(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: movingLabels.alreadyHaveAList }),
  ).toBeVisible({ timeout: 10_000 });
});

When("I expand extra services that reveal detail fields", async ({ page }) => {
  // Waste disposal + Assembly show free-text inputs; Short term storage shows a duration select.
  for (const label of [
    /^Waste disposal$|^廢棄物處理$/,
    /^Assembly\/Disassembly$|^拆裝$/,
    /^Short term storage$|^短期寄存$/,
  ]) {
    const row = page
      .locator("div.flex.h-14.items-center.gap-4")
      .filter({ has: page.getByText(label) });
    await expect(row).toBeVisible();
    await row.getByRole("checkbox").click();
    await expect(row.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
  }

  await expect(page.getByPlaceholder(/What to dispose|棄置/i)).toBeVisible();
  await expect(page.getByPlaceholder(/What to assemble|組裝/i)).toBeVisible();
  await expect(page.getByText(/For how long|多久/i)).toBeVisible();
});

When(
  "I select overseas from country {string}",
  async ({ page }, country: string) => {
    await page.getByRole("button", { name: movingLabels.select }).first().click();
    await page.getByRole("menuitem", { name: country }).click();
    if (country === "Hong Kong") {
      await expect(page.getByRole("button", { name: /District|地區/ })).toBeVisible({
        timeout: 10_000,
      });
    } else if (country === "Canada") {
      await expect(
        page.getByPlaceholder(/Specify more|進一步說明/i).first(),
      ).toBeVisible({ timeout: 10_000 });
    }
  },
);

When(
  "I select overseas to country {string}",
  async ({ page }, country: string) => {
    // After From is filled, the remaining empty country picker still says "Select".
    await page.getByRole("button", { name: movingLabels.select }).first().click();
    await page.getByRole("menuitem", { name: country }).click();
    if (country === "Canada" || country === "Hong Kong") {
      await expect(
        page.getByPlaceholder(/Specify more|進一步說明/i).last(),
      ).toBeVisible({ timeout: 10_000 });
    }
  },
);
