import { createBdd } from "playwright-bdd";
import {
  expectNoPackingDescriptionField,
  expectPackingServiceOptionVisible,
  openStandardMovingExtraServices,
  selectPackingIntoCartons,
} from "../lib/pages/extra-services.js";

const { Given, When, Then } = createBdd();

Given("I am on the standard moving extra services step", async ({ page }) => {
  await openStandardMovingExtraServices(page);
});

When("I select the packing into cartons option", async ({ page }) => {
  await selectPackingIntoCartons(page);
});

Then("the packing into cartons option should remain available", async ({ page }) => {
  await expectPackingServiceOptionVisible(page);
});

Then("no free-text field should appear for the packing service", async ({ page }) => {
  await expectNoPackingDescriptionField(page);
});
