/**
 * Expected `disposal_only_submitted` properties after BET-4135.
 *
 * Source: BET-4097 event list #14 (preferred_time = selected time slot).
 */
export const DISPOSAL_ONLY_SUBMITTED_REQUIRED_PROPERTIES = [
  "collection_location",
  "preferred_time",
  "remarks_length",
  "total_photos_uploaded",
  "total_items_counted",
  "builder_time_secs",
] as const;

export type DisposalOnlySubmittedProperty =
  (typeof DISPOSAL_ONLY_SUBMITTED_REQUIRED_PROPERTIES)[number];

/** Time slot selected by shared disposal flow (`selectMoveTime` default). */
export const DISPOSAL_SUBMIT_EXPECTED_TIME = "9:00 am";
