export type Bet4377Vehicle = "Van" | "5.5 ton truck" | "9 ton truck";

export const BET4377_PALLET_BODY_TEXT =
  "Each pallet includes loading and unloading";

export const bet4377TooltipSnippets: Record<
  Bet4377Vehicle,
  { mustInclude: RegExp[]; mustExclude?: RegExp[] }
> = {
  Van: {
    mustInclude: [/Free cart rental is included/i, /3 hand trolleys/i],
    mustExclude: [/forklift rental/i, /standard pallets/i],
  },
  "5.5 ton truck": {
    mustInclude: [
      /Free forklift rental is included/i,
      /5 standard pallets/i,
      /de-palletising/i,
    ],
    mustExclude: [/3 hand trolleys/i, /6 standard pallets/i],
  },
  "9 ton truck": {
    mustInclude: [
      /Free forklift rental is included/i,
      /6 standard pallets/i,
      /de-palletising/i,
    ],
    mustExclude: [/3 hand trolleys/i, /5 standard pallets/i],
  },
};

export const bet4377ShowsPalletOptions: Record<Bet4377Vehicle, boolean> = {
  Van: false,
  "5.5 ton truck": true,
  "9 ton truck": true,
};
