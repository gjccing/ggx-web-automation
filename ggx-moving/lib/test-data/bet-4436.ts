/** BET-4436 — empty required move date on all enquiry forms. */

export type Bet4436Service = "standard" | "disposal" | "corporate" | "overseas";

export const bet4436EnquiryPath: Record<Bet4436Service, RegExp> = {
  standard: /\/std-moving\/move-details/,
  disposal: /\/disposal-only\/disposal-details/,
  corporate: /\/corporate-moving-services/,
  overseas: /\/overseas-moving/,
};

export function parseBet4436Service(service: string): Bet4436Service {
  if (
    service !== "standard" &&
    service !== "disposal" &&
    service !== "corporate" &&
    service !== "overseas"
  ) {
    throw new Error(
      `Unsupported BET-4436 service "${service}" — use standard, disposal, corporate, or overseas`,
    );
  }
  return service;
}
