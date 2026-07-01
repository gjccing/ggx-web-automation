import type { GgxbRegion } from "../../env.js";

export type DeliveryWaypointFixture = {
  address: string;
  floorRoom: string;
  contactName: string;
  phone: string;
};

export type DeliveryPackageFixture = {
  content: string;
  length: string;
  width: string;
  height: string;
  weight: string;
};

export const deliveryOrderFixture: Record<
  GgxbRegion,
  {
    from: DeliveryWaypointFixture;
    to: DeliveryWaypointFixture;
    package: DeliveryPackageFixture;
  }
> = {
  hk: {
    from: {
      address: "Mee Lun House, Mee Lun Street, Central, 香港",
      floorRoom: "QA",
      contactName: "Jack",
      phone: "34444444",
    },
    to: {
      address: "Kwun Tong Station, 觀塘香港",
      floorRoom: "12A",
      contactName: "Jack",
      phone: "22222222",
    },
    package: {
      content: "Flowers",
      length: "30",
      width: "10",
      height: "15",
      weight: "10",
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
      address: "Kaki Bukit Avenue 1, Kaki Bukit MRT Station (DT28), Singapore",
      floorRoom: "12A",
      contactName: "Jack",
      phone: "82222222",
    },
    package: {
      content: "Documents",
      length: "30",
      width: "10",
      height: "15",
      weight: "5",
    },
  },
};

/** Delivery order IDs look like `nRuyEA` (6 alphanumeric chars after `#`). */
export const DELIVERY_ORDER_ID_PATTERN = /^[a-zA-Z0-9]{6}$/;
