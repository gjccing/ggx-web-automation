import type { GgxbRegion } from "../../env.js";

export type TransportWaypointFixture = {
  address: string;
  floorRoom: string;
  contactName: string;
  phone: string;
};

export const transportOrderFixture: Record<
  GgxbRegion,
  { from: TransportWaypointFixture; to: TransportWaypointFixture }
> = {
  hk: {
    from: {
      address: "Kwun Tong Station, 觀塘香港",
      floorRoom: "12A",
      contactName: "Jack",
      phone: "22222222",
    },
    to: {
      address: "Causeway Bay Plaza 1, 軒尼詩道銅鑼灣香港",
      floorRoom: "12A",
      contactName: "Jack",
      phone: "22222222",
    },
  },
  sg: {
    from: {
      address: "18 New Industrial Road, Singapore",
      floorRoom: "12A",
      contactName: "Jack",
      phone: "82222222",
    },
    to: {
      address:
        "Kaki Bukit Avenue 1, Kaki Bukit MRT Station (DT28), Singapore",
      floorRoom: "12A",
      contactName: "Jack",
      phone: "82222222",
    },
  },
};

export const TRANSPORT_ORDER_ID_PATTERN = /^[A-Z]{2}\d{7}$/;
