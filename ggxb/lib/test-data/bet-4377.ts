export type Bet4377Locale = "en-HK" | "zh-HK";

export type Bet4377Vehicle =
  | "Van"
  | "5.5 ton truck"
  | "9 ton truck"
  | "Van仔"
  | "5.5 噸貨車"
  | "9 噸貨車";

export const bet4377VehiclesByLocale: Record<
  Bet4377Locale,
  [Bet4377Vehicle, Bet4377Vehicle, Bet4377Vehicle]
> = {
  "en-HK": ["Van", "5.5 ton truck", "9 ton truck"],
  "zh-HK": ["Van仔", "5.5 噸貨車", "9 噸貨車"],
};

export const bet4377PalletBodyText: Record<Bet4377Locale, string> = {
  "en-HK": "Each pallet includes loading and unloading",
  "zh-HK": "每板貨包括一次上貨及一次落貨",
};

export const bet4377NumberOfPalletsLabel: Record<Bet4377Locale, RegExp> = {
  "en-HK": /^Number of pallets$/,
  "zh-HK": /^每板貨載貨量$/,
};

/** Source: BET-4377 Jira — Crowdin keys `tooltip__description__service_remarks__*`. */
export const bet4377TooltipText: Record<
  Bet4377Locale,
  Record<Bet4377Vehicle, string>
> = {
  "en-HK": {
    Van: `• Free cart rental is included.
• Free loading/unloading time is included with the service. For pick-up or drop-off locations without the 'Fixed-price Moving' service, the driver will have 15 minutes of free loading/unloading time after arriving at the customer's specified time. If the time limit is exceeded, the driver may charge overtime waiting fees.
• Tunnels, bridges or any parking charges are not included in the fee.
• Carpark (within 50m) should be available at the pick-up or drop-off locations.
• Each location can include a maximum of 3 stair steps at the lift lobby, otherwise please select "Driver quote".
• The total volume or weight of goods must not exceed 3 hand trolleys.`,
    "5.5 ton truck": `• Free forklift rental is included.
• Free loading/unloading time is included with the service. For pick-up or drop-off locations without the 'Fixed-price Moving' service, the driver will have 15 minutes of free loading/unloading time after arriving at the customer's specified time. If the time limit is exceeded, the driver may charge overtime waiting fees.
• Tunnels, bridges or any parking charges are not included in the fee.
• Carpark (within 50m) should be available at the pick-up or drop-off locations.
• The total volume or weight of goods must not exceed 5 standard pallets.
• The current fixed-price moving service fee for trucks does not cover de-palletising. The driver is only responsible for using a pallet jack to assist with loading, unloading, and transporting whole pallets.`,
    "9 ton truck": `• Free forklift rental is included.
• Free loading/unloading time is included with the service. For pick-up or drop-off locations without the 'Fixed-price Moving' service, the driver will have 15 minutes of free loading/unloading time after arriving at the customer's specified time. If the time limit is exceeded, the driver may charge overtime waiting fees.
• Tunnels, bridges or any parking charges are not included in the fee.
• Carpark (within 50m) should be available at the pick-up or drop-off locations.
• The total volume or weight of goods must not exceed 6 standard pallets.
• The current fixed-price moving service fee for trucks does not cover de-palletising. The driver is only responsible for using a pallet jack to assist with loading, unloading, and transporting whole pallets.`,
  },
  "zh-HK": {
    Van仔: `• 定價收費已包括借手推車費用。
• 「定價幫搬」服務可享免費上落貨時間。而於未有選擇「定價幫搬」服務的上/落貨點，司機於客人指定時間到達後，則享有15分鐘免費上落貨時間。如超出時間，司機可按超時等候收費。
• 隧道費，橋費，停車場費未包括在內。
• 50米內須有停車場
• 定價收費只包括於上落貨點電梯大堂3級樓梯的搬運費用，否則請選擇司機報價。
• 貨物總體積或總重量不超過 3 架手推車。`,
    "5.5 噸貨車": `• 定價收費已包括借唧車費用。
• 「定價幫搬」服務可享免費上落貨時間。而於未有選擇「定價幫搬」服務的上/落貨點，司機於客人指定時間到達後，則享有15分鐘免費上落貨時間。如超出時間，司機可按超時等候收費。
• 隧道費，橋費，停車場費未包括在內。
• 50米內須有停車場
• 貨物總體積或總重量分別不超過 5 板標準卡板。
• 現行的噸車定價幫搬服務費用不涵蓋拆板，司機僅負責使用唧車協助整組卡板的上落貨與運送`,
    "9 噸貨車": `• 定價收費已包括借唧車費用。
• 「定價幫搬」服務可享免費上落貨時間。而於未有選擇「定價幫搬」服務的上/落貨點，司機於客人指定時間到達後，則享有15分鐘免費上落貨時間。如超出時間，司機可按超時等候收費。
• 隧道費，橋費，停車場費未包括在內。
• 50米內須有停車場
• 貨物總體積或總重量分別不超過 6 板標準卡板。
• 現行的噸車定價幫搬服務費用不涵蓋拆板，司機僅負責使用唧車協助整組卡板的上落貨與運送`,
  },
};

export function normalizeTooltipText(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

export function parseBet4377Locale(locale: string): Bet4377Locale {
  if (locale !== "en-HK" && locale !== "zh-HK") {
    throw new Error(`Unsupported BET-4377 locale "${locale}" — use "en-HK" or "zh-HK"`);
  }
  return locale;
}

export function parseBet4377Vehicle(vehicle: string): Bet4377Vehicle {
  const vehicles = [
    ...bet4377VehiclesByLocale["en-HK"],
    ...bet4377VehiclesByLocale["zh-HK"],
  ];
  if (!vehicles.includes(vehicle as Bet4377Vehicle)) {
    throw new Error(`Unsupported BET-4377 vehicle "${vehicle}"`);
  }
  return vehicle as Bet4377Vehicle;
}
