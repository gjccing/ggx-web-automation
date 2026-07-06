import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { expectVanRentalDownloadDialog } from "../../lib/pages/homepage.js";

const { Then } = createBdd();

Then("the van rental download app dialog should appear", async ({ page }) => {
  await expectVanRentalDownloadDialog(page);
});
