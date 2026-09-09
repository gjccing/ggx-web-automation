import { stripeTestCard } from "./stripe.js";

/** Invalid PAN from BET-4450 — Stripe returns "Your card number is incorrect." */
export const bet4450InvalidCard = {
  number: "1234432112344321",
  expiryDisplay: "12 / 29",
  cvc: "123",
} as const;

export const bet4450SuccessCard = {
  number: stripeTestCard.number,
  expiryDisplay: "12 / 29",
  cvc: stripeTestCard.cvc,
} as const;

export const bet4450CardNickname = "BET-4450 E2E";
