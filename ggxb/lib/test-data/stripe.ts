/**
 * Stripe test cards — https://docs.stripe.com/testing
 * Use test API keys on the merchant side; enter these in payment forms only.
 */
export const stripeTestCard = {
  /** Visa — succeeds in all countries */
  number: "4242424242424242",
  /** Any 3 digits per Stripe docs */
  cvc: "123",
  /** Any future date — MMYY without slash for Stripe Elements */
  expiry: "1229",
} as const;

export const automationCardNickname = "Automation E2E";
