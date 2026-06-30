import { expect, type FrameLocator, type Page } from "@playwright/test";
import { closeTopUpModal } from "../navigation/side-menu.js";
import {
  automationCardNickname,
  stripeTestCard,
} from "../test-data/stripe.js";

function topUpModal(page: Page) {
  return page.getByTestId("top-up-modal-wrapper");
}

function stripeCardFrame(page: Page): FrameLocator {
  const addCardDialog = page
    .getByRole("dialog")
    .filter({ has: page.getByRole("heading", { name: /^Add card$/i }) });
  return addCardDialog.frameLocator("iframe").first();
}

export async function fillStripeCardDetails(
  page: Page,
  nickname: string = automationCardNickname,
): Promise<void> {
  const frame = stripeCardFrame(page);
  const legacyFrame = page.frameLocator(".__PrivateStripeElement iframe");

  if ((await legacyFrame.locator("#Field-numberInput").count()) > 0) {
    await legacyFrame.locator("#Field-numberInput").fill(stripeTestCard.number);
    await legacyFrame.locator("#Field-expiryInput").fill(stripeTestCard.expiry);
    await legacyFrame.locator("#Field-cvcInput").fill(stripeTestCard.cvc);
  } else {
    await frame
      .getByRole("textbox", { name: /Card number/i })
      .fill(stripeTestCard.number);
    await frame
      .getByRole("textbox", { name: /Expiration date/i })
      .fill("12 / 29");
    await frame
      .getByRole("textbox", { name: /Security code/i })
      .fill(stripeTestCard.cvc);
  }

  const nicknameField = page.locator('input[name="nickname"]');
  if (await nicknameField.isVisible().catch(() => false)) {
    await nicknameField.fill(nickname);
  } else {
    await page
      .getByPlaceholder(/Department card/i)
      .fill(nickname);
  }
}

async function confirmRemoveCard(page: Page): Promise<void> {
  const removeBtn = page.getByRole("button", { name: /^Remove card$/i });
  await expect(removeBtn).toBeVisible({ timeout: 10_000 });
  await removeBtn.click();
  await removeBtn.click();
  await expect(page.getByText(/Card removed successfully/i)).toBeVisible({
    timeout: 30_000,
  });
}

async function ensureCardSlotAvailable(page: Page): Promise<void> {
  const modal = topUpModal(page);
  if (await modal.getByText("Add card", { exact: true }).isVisible().catch(() => false)) {
    return;
  }

  const expendableEdit = modal.locator(
    'xpath=.//p[contains(.,"Expired") or normalize-space()="Jcb Card" or normalize-space()="4244242"]/following::a[normalize-space()="Edit"][1]',
  );
  if (await expendableEdit.isVisible().catch(() => false)) {
    await expendableEdit.click();
    await confirmRemoveCard(page);
  }
}

async function clickAddCardInModal(page: Page): Promise<void> {
  const modal = topUpModal(page);
  await ensureCardSlotAvailable(page);

  const addCard = modal.getByText("Add card", { exact: true });
  if (!(await addCard.isVisible().catch(() => false))) {
    throw new Error(
      "Cannot add card: top-up modal has no Add card action after freeing a slot",
    );
  }
  await addCard.click();
}

export async function addCreditCardFromTopUpModal(
  page: Page,
  nickname: string = automationCardNickname,
): Promise<void> {
  await clickAddCardInModal(page);
  await fillStripeCardDetails(page, nickname);
  const addCardDialog = page
    .getByRole("dialog")
    .filter({ has: page.getByRole("heading", { name: /^Add card$/i }) });
  await addCardDialog.getByRole("button", { name: /^Add card$/i }).click();
  await expect(page.getByText(/Card added successfully/i)).toBeVisible({
    timeout: 30_000,
  });
}

export async function removeCreditCardByNickname(
  page: Page,
  nickname: string,
): Promise<void> {
  const modal = topUpModal(page);
  const editLink = modal.locator(
    `xpath=.//p[normalize-space()="${nickname}"]/following::a[normalize-space()="Edit"][1]`,
  );
  await expect(editLink.first()).toBeVisible({ timeout: 15_000 });
  await editLink.first().click();
  await confirmRemoveCard(page);
}

function automationCardCount(page: Page): Promise<number> {
  return topUpModal(page)
    .getByText(automationCardNickname, { exact: true })
    .count();
}

/** Keep exactly one automation card for payment flows. */
export async function ensureSingleAutomationCard(page: Page): Promise<void> {
  while ((await automationCardCount(page)) > 1) {
    await removeCreditCardByNickname(page, automationCardNickname);
  }
  if ((await automationCardCount(page)) === 0) {
    await addCreditCardFromTopUpModal(page);
  }
}

export async function deleteAutomationCardIfPresent(
  page: Page,
  options?: { closeAfter?: boolean },
): Promise<void> {
  while ((await automationCardCount(page)) > 0) {
    await removeCreditCardByNickname(page, automationCardNickname);
  }
  if (options?.closeAfter) {
    await closeTopUpModal(page);
  }
}

/** Dropdown option index — reference uses `4` for $100 (+ bonus free credit). */
export async function selectTopUpAmountOption(
  page: Page,
  optionIndex: number,
): Promise<number> {
  await page.getByTestId("topup-modal-dropdown").click();
  await page
    .getByTestId("dropdown-option")
    .nth(optionIndex - 1)
    .click();
  await expect(page.getByTestId("dropdown-menu")).toBeHidden({
    timeout: 10_000,
  });

  const amountText =
    (await page.getByTestId("topup-modal-dropdown").innerText()) ?? "";
  const paidMatch = amountText.match(/\$(\d+)/);
  const freeMatch = amountText.match(/\(\+\$(\d+)/);
  const paid = paidMatch ? Number(paidMatch[1]) : 0;
  const free = freeMatch ? Number(freeMatch[1]) : 0;
  return paid + free;
}

export async function confirmTopUpPayment(page: Page): Promise<void> {
  const modal = topUpModal(page);
  await modal.locator('[data-cy="pay_now_btn"]').click();
  await modal.getByText(/^Confirm$/i).click();
  await expect(topUpModal(page)).toBeHidden({ timeout: 60_000 });
}

export { closeTopUpModal };

export async function selectPaymentCardInTopUpModal(
  page: Page,
  nickname: string,
): Promise<void> {
  const modal = topUpModal(page);
  await modal.getByText(nickname, { exact: true }).first().click();
}
