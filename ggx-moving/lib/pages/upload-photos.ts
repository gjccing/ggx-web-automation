import { expect, type Page, type Response } from "@playwright/test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { movingLabels } from "../labels.js";
import { movingTestContext } from "../test-data/test-context.js";
import { clickWizardNext, fillFinalDetailsAndSubmit } from "./wizard.js";
import type { ContactFixture } from "../test-data/order-fixture.js";

const fixturePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../test-data/fixtures/e2e-upload.png",
);
const fixtureBytes = readFileSync(fixturePath);

function isTmpUploadResponse(res: Response): boolean {
  if (res.request().method() !== "POST") return false;
  const pathname = new URL(res.url()).pathname;
  return pathname === "/api/upload/tmp" || pathname.endsWith("/api/upload/tmp");
}

function isCreateFolderResponse(res: Response): boolean {
  if (res.request().method() !== "POST") return false;
  const pathname = new URL(res.url()).pathname;
  return (
    pathname === "/api/upload/folder" || pathname.endsWith("/api/upload/folder")
  );
}

function isMoveToOrderFolderResponse(res: Response): boolean {
  if (res.request().method() !== "PUT") return false;
  return /\/api\/upload\/tmp\/[^/]+$/.test(new URL(res.url()).pathname);
}

async function stubDriveThumbnails(page: Page): Promise<void> {
  // Fresh Drive uploads often 404 on lh3 thumbnails briefly; the app's onImageError
  // then strips upload_photos from the form. Stub so previews stay attached.
  await page.route("**/lh3.googleusercontent.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "image/png",
      body: fixtureBytes,
    });
  });
}

async function readUploadedPhotoUrls(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    for (const key of ["std-moving", "disposal-only"]) {
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as { upload_photos?: unknown };
        if (Array.isArray(parsed.upload_photos)) {
          return parsed.upload_photos.filter(
            (url): url is string => typeof url === "string" && url.length > 0,
          );
        }
      } catch {
        /* ignore */
      }
    }
    return [];
  });
}

export async function selectPhotoOnExtraServices(
  page: Page,
  photoPath: string = fixturePath,
): Promise<void> {
  await stubDriveThumbnails(page);

  const uploadPromise = page.waitForResponse(isTmpUploadResponse, {
    timeout: 60_000,
  });

  await page
    .locator('input[type="file"][accept*="image"]')
    .setInputFiles(photoPath);

  const uploadResponse = await uploadPromise;
  expect(
    uploadResponse.status(),
    `POST /api/upload/tmp returned ${uploadResponse.status()}`,
  ).toBeLessThan(400);
  expect(uploadResponse.ok()).toBeTruthy();

  const body = (await uploadResponse.json()) as {
    files?: Array<{ id?: string }>;
  };
  const fileIds = (body.files ?? [])
    .map((file) => file.id)
    .filter((id): id is string => Boolean(id));
  expect(fileIds.length).toBeGreaterThan(0);
  movingTestContext.uploadedFileIds = fileIds;

  await expect(page.getByAltText(/^preview-/).first()).toBeVisible({
    timeout: 30_000,
  });
  // Extra-services shows a full-screen Loading dialog while tmp upload runs.
  await expect(page.getByText("Loading...")).toBeHidden({ timeout: 30_000 });

  // MovingFormProvider debounces session persist by 300ms and cancels on unmount —
  // wait until upload_photos is written before leaving the step.
  await expect
    .poll(async () => (await readUploadedPhotoUrls(page)).length, {
      timeout: 5_000,
    })
    .toBeGreaterThan(0);

  const urls = await readUploadedPhotoUrls(page);
  for (const fileId of fileIds) {
    expect(urls.some((url) => url.includes(fileId))).toBeTruthy();
  }
}

export async function expectPhotoPreviewVisible(page: Page): Promise<void> {
  await expect(page.getByAltText(/^preview-/)).toHaveCount(1);
  await expect(page.getByText(movingLabels.uploadPhotosTitle)).toBeVisible();
}

export async function expectNoPhotoPreview(page: Page): Promise<void> {
  await expect(page.getByAltText(/^preview-/)).toHaveCount(0);
}

export async function expectUploadLoadingHidden(page: Page): Promise<void> {
  await expect(page.getByText("Loading...")).toBeHidden({ timeout: 30_000 });
}

export async function selectOverLimitPhotoOnExtraServices(
  page: Page,
  photoPath: string,
): Promise<void> {
  await page
    .locator('input[type="file"][accept*="image"]')
    .setInputFiles(photoPath);
}

export async function expectTmpUploadCompleted(): Promise<void> {
  expect(movingTestContext.uploadedFileIds?.length ?? 0).toBeGreaterThan(0);
}

export async function completeQuoteFromExtraServicesWithPhotos(
  page: Page,
  contact: ContactFixture,
): Promise<string> {
  // Re-check session right before leaving extras — onImageError can clear failed thumbs.
  await expect
    .poll(async () => (await readUploadedPhotoUrls(page)).length, {
      timeout: 5_000,
    })
    .toBeGreaterThan(0);

  const createFolderPromise = page.waitForResponse(isCreateFolderResponse, {
    timeout: 90_000,
  });
  const movePromise = page.waitForResponse(isMoveToOrderFolderResponse, {
    timeout: 90_000,
  });

  await clickWizardNext(page);
  await expect(page).toHaveURL(/final-details/);

  // Confirm photos survived navigation into final-details.
  await expect
    .poll(async () => (await readUploadedPhotoUrls(page)).length, {
      timeout: 5_000,
    })
    .toBeGreaterThan(0);

  const orderId = await fillFinalDetailsAndSubmit(page, contact);

  const createFolder = await createFolderPromise;
  expect(createFolder.ok()).toBeTruthy();
  const folderBody = (await createFolder.json()) as { folderId?: string };
  expect(folderBody.folderId).toBeTruthy();
  movingTestContext.photosFolderId = folderBody.folderId;
  movingTestContext.photosFolderUrl = `https://drive.google.com/drive/folders/${folderBody.folderId}`;

  const moveResponse = await movePromise;
  expect(moveResponse.ok()).toBeTruthy();
  const movePayload = moveResponse.request().postDataJSON() as {
    fileIds?: string[];
  };
  expect(movePayload.fileIds).toEqual(movingTestContext.uploadedFileIds);

  const moveUrl = new URL(moveResponse.url());
  expect(moveUrl.pathname).toContain(
    `/api/upload/tmp/${movingTestContext.photosFolderId}`,
  );

  return orderId;
}
