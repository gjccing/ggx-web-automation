/**
 * BET-4142 — Mixpanel time properties must use seconds, not milliseconds.
 *
 * In scope:
 * - address_popup_confirmed.popup_time_secs — duration in seconds
 * - moving_form_submitted.time_to_submit — Unix epoch seconds at submit
 * Out of scope: moving_user_exited (event no longer exists).
 */

export const ADDRESS_POPUP_CONFIRMED_EVENT = "address_popup_confirmed";
export const MOVING_FORM_SUBMITTED_EVENT = "moving_form_submitted";

export const POPUP_TIME_SECS_PROPERTY = "popup_time_secs";
export const TIME_TO_SUBMIT_PROPERTY = "time_to_submit";

export const ADDRESS_POPUP_CONFIRMED_REQUIRED_PROPERTIES = [
  POPUP_TIME_SECS_PROPERTY,
] as const;

export const MOVING_FORM_SUBMITTED_REQUIRED_PROPERTIES = [
  TIME_TO_SUBMIT_PROPERTY,
] as const;
