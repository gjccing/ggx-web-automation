import { createBdd } from "playwright-bdd";
import {
  CATEGORY_ORDER,
  expectActiveTabTracksSections,
} from "../lib/pages/items-to-move.js";

const { Then } = createBdd();

Then(
  "the active category tab should follow each section while scrolling down",
  async ({ page }) => {
    await expectActiveTabTracksSections(page, CATEGORY_ORDER);
  },
);

Then(
  "the active category tab should follow each section while scrolling up",
  async ({ page }) => {
    await expectActiveTabTracksSections(page, [...CATEGORY_ORDER].reverse());
  },
);
