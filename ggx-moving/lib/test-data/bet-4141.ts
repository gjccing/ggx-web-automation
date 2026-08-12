/**
 * BET-4141 — `items_builder_completed.total_items_counted` must sum quantities.
 *
 * Bug: quantity 2 of one item was reported as 1 (unique count).
 * Fix: sum of selected item quantities.
 */

export const ITEMS_BUILDER_COMPLETED_REQUIRED_PROPERTIES = [
  "total_items_counted",
  "unique_items",
  "num_variants_used",
  "num_tabs_visited",
  "builder_time_secs",
  "has_others_items",
  "avg_quantity_per_item",
] as const;

/** Simple Furniture catalog item (no size variants) used for the quantity sum case. */
export const BET_4141_FURNITURE_ITEM = "Office chair";

/** Quantity that distinguishes sum (2) from unique-item count (1). */
export const BET_4141_ITEM_QUANTITY = 2;
