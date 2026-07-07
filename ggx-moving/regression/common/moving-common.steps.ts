import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  clickHomepageCta,
  openHomepage,
  selectService,
  switchLanguage,
} from "../../lib/pages/homepage.js";
import { getSessionStorage } from "../../lib/session.js";
import {
  movingTestContext,
  resetMovingTestContext,
} from "../../lib/test-data/test-context.js";

const { Given, When, Then } = createBdd();

function expectSessionFieldsCleared(
  values: Record<string, unknown> | null,
): void {
  if (!values || Object.keys(values).length === 0) return;

  const preservedKeys = new Set(["date"]);
  for (const [key, value] of Object.entries(values)) {
    if (preservedKeys.has(key)) continue;
    if (value && typeof value === "object") {
      expectSessionFieldsCleared(value as Record<string, unknown>);
      continue;
    }
    expect(value === "" || value === null || value === undefined).toBe(true);
  }
}

Given("a fresh GGX Moving test run", async () => {
  resetMovingTestContext();
});

Given("I open the GGX Moving homepage", async ({ page }) => {
  await openHomepage(page);
});

Given(
  "I open the GGX Moving homepage with query {string}",
  async ({ page }, query: string) => {
    await openHomepage(page, "en-HK", query, { clearSession: false });
  },
);

When(
  "I select the {string} service on the homepage",
  async ({ page }, service: string) => {
    const normalized = service as
      | "standard"
      | "corporate"
      | "van-rental"
      | "disposal"
      | "overseas";
    await selectService(page, normalized);
  },
);

When("I click the homepage call to action", async ({ page }) => {
  await clickHomepageCta(page);
});

When("I reload the GGX Moving page", async ({ page }) => {
  await page.reload();
});

When(
  "I switch GGX Moving language to {string}",
  async ({ page }, locale: string) => {
    if (locale !== "en-HK" && locale !== "zh-HK") {
      throw new Error(`Unsupported locale "${locale}"`);
    }
    await switchLanguage(page, locale);
  },
);

Then(
  "I should be on the {string} {string} page",
  async ({ page }, service: string, step: string) => {
    await expect(page).toHaveURL(new RegExp(`/${service}/${step}`));
  },
);

Then("I should be on the {string} page", async ({ page }, path: string) => {
  await expect(page).toHaveURL(new RegExp(`/${path}`));
});

Then(
  "the homepage should be displayed in {string}",
  async ({ page }, locale: string) => {
    if (locale === "zh-HK") {
      await expect(
        page.getByRole("heading", { name: "請選擇您的搬運服務" }),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "中" })).toBeVisible();
      return;
    }
    await expect(
      page.getByRole("heading", { name: "Select your moving type" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "EN" })).toBeVisible();
  },
);

Then("the captured UTM session should include:", async ({ page }, table) => {
  const utm = await getSessionStorage<Record<string, string>>(page, "utm");
  expect(utm).not.toBeNull();
  for (const row of table.hashes()) {
    expect(utm?.[row.field]).toBe(row.value);
  }
});

Then(
  "the {string} session should be cleared after submit",
  async ({ page }, key: string) => {
    // resetStore() is deferred by 1s after submit; poll until session is cleared.
    await expect
      .poll(
        async () => {
          const values = await getSessionStorage<Record<string, unknown>>(
            page,
            key,
          );
          if (!values || Object.keys(values).length === 0) {
            return true;
          }
          try {
            expectSessionFieldsCleared(values);
            return true;
          } catch {
            return false;
          }
        },
        { timeout: 3000 },
      )
      .toBe(true);
  },
);

Then(
  "the {string} session should contain saved move details",
  async ({ page }, key: string) => {
    const values = await getSessionStorage<{
      from?: { address: string };
      to?: { address: string };
      date?: string;
      time?: string;
    }>(page, key);
    expect(values?.from?.address).toBeTruthy();
    if (key === "std-moving") {
      expect(values?.to?.address).toBeTruthy();
    }
    expect(values?.date).toBeTruthy();
    expect(values?.time).toBeTruthy();
  },
);

Then(
  "the {string} session should contain saved form data",
  async ({ page }, key: string) => {
    const values = await getSessionStorage<Record<string, string>>(page, key);
    expect(values?.from || values?.contact_name).toBeTruthy();
  },
);
