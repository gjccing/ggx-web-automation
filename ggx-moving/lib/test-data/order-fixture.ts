export type WaypointFixture = {
  district: string;
  street: string;
  lift: string;
  stairs: string;
  /** "Distance from parking to door" — optional field (BET-4380). Omit to skip. */
  distance?: string;
  blockFloor?: string;
};

export type ContactFixture = {
  name: string;
  phone: string;
  email: string;
};

export const stdMovingWaypoints = {
  from: {
    district: "Central & Western",
    street: "Queen's Road Central 1",
    lift: "No lift",
    stairs: "No stairs needed",
    distance: "On-premises parking",
    blockFloor: "12/F Room A",
  },
  to: {
    district: "Wan Chai",
    street: "Hennessy Road 100",
    lift: "Direct lift to floor",
    stairs: "1-4 Steps",
    distance: "50 m or less",
    blockFloor: "8/F",
  },
} satisfies Record<"from" | "to", WaypointFixture>;

export const disposalWaypoint: WaypointFixture = {
  district: "Sha Tin",
  street: "Sha Tin Centre Street 1",
  lift: "No lift",
  stairs: "No stairs needed",
  distance: "On-premises parking",
};

export function contactFixture(runId: string): ContactFixture {
  return {
    name: `E2E ${runId}`,
    phone: "45678901",
    email: `e2e.${runId.replace(/\s+/g, ".").toLowerCase()}@gogox.test`,
  };
}

export const corporateAddresses = {
  from: { district: "Kwun Tong", street: "Kwun Tong Road 10" },
  to: { district: "Tsuen Wan", street: "Castle Peak Road 20" },
};

export const overseasCountries = {
  from: "Hong Kong",
  to: "United Kingdom",
};

export const overseasHongKongDetail = {
  district: "Central & Western",
  street: "Queen's Road Central 1",
};

export const ORDER_ID_PATTERN = /^J\d{5,}$/;
