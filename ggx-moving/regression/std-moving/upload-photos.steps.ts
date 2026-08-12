import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { openStandardMovingExtraServices } from "../../lib/pages/extra-services.js";
import {
  completeQuoteFromExtraServicesWithPhotos,
  expectPhotoPreviewVisible,
  expectTmpUploadCompleted,
  selectPhotoOnExtraServices,
} from "../../lib/pages/upload-photos.js";
import { fetchOrderRowByOrderId } from "../../lib/sheets/order-sheet.js";
import {
  contactFixture,
  ORDER_ID_PATTERN,
} from "../../lib/test-data/order-fixture.js";
import { movingTestContext } from "../../lib/test-data/test-context.js";

const { Given, When, Then } = createBdd();

function contact() {
  const fixture = contactFixture(movingTestContext.runId);
  movingTestContext.contactName = fixture.name;
  movingTestContext.contactPhone = `+852${fixture.phone}`;
  movingTestContext.contactEmail = fixture.email;
  return fixture;
}

Given("I open the standard moving extra services step", async ({ page }) => {
  test.setTimeout(120_000);
  await openStandardMovingExtraServices(page);
});

When("I select a photo on the extra services step", async ({ page }) => {
  test.setTimeout(120_000);
  await selectPhotoOnExtraServices(page);
});

Then("the photo should be uploaded to the temporary folder", async () => {
  await expectTmpUploadCompleted();
});

Then("the photo preview should be visible", async ({ page }) => {
  await expectPhotoPreviewVisible(page);
});

When(
  "I complete the quote from extra services with the uploaded photo",
  async ({ page }) => {
    test.setTimeout(180_000);
    movingTestContext.orderId = await completeQuoteFromExtraServicesWithPhotos(
      page,
      contact(),
    );
    expect(movingTestContext.orderId).toMatch(ORDER_ID_PATTERN);
  },
);

Then(
  "the uploaded photo should be moved into the order Drive folder",
  async () => {
    expect(movingTestContext.photosFolderId).toBeTruthy();
    expect(movingTestContext.photosFolderUrl).toMatch(
      /^https:\/\/drive\.google\.com\/drive\/folders\//,
    );
    expect(movingTestContext.uploadedFileIds?.length).toBeGreaterThan(0);
  },
);

Then(
  "the latest Google Sheet row should include the photos Drive folder link",
  async () => {
    const orderId = movingTestContext.orderId;
    expect(orderId).toBeTruthy();
    const row = await fetchOrderRowByOrderId(orderId!);
    expect(row.photosFolderUrl).toBe(movingTestContext.photosFolderUrl);
  },
);
