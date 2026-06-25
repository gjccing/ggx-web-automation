export type GgxbRegion = "hk" | "sg";

const BASE_URL_ENV: Record<GgxbRegion, string> = {
  hk: "GGXB_HK_BASE_URL",
  sg: "GGXB_SG_BASE_URL",
};

const LEGACY_BASE_URL_ENV = "GGXB_BASE_URL";

export function ggxbBaseUrl(region: GgxbRegion): string {
  const regional = process.env[BASE_URL_ENV[region]];
  if (regional) return regional;

  if (region === "hk") {
    const legacy = process.env[LEGACY_BASE_URL_ENV];
    if (legacy) return legacy;
  }

  const hint = region === "hk" ? ` (or legacy ${LEGACY_BASE_URL_ENV})` : "";
  throw new Error(
    `Set ${BASE_URL_ENV[region]} in the repo root .env file${hint}`,
  );
}
