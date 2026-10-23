export type GgxbRegion = "hk" | "sg";

const BASE_URL_ENV: Record<GgxbRegion, string> = {
  hk: "GGXB_HK_BASE_URL",
  sg: "GGXB_SG_BASE_URL",
};

const LEGACY_BASE_URL_ENV = "GGXB_BASE_URL";

const DEFAULT_API_BASE_URL: Record<GgxbRegion, string> = {
  hk: "https://stag-hk.gogovan.tech",
  sg: "https://stag-sg.gogovan.tech",
};

export function ggxbApiBaseUrl(region: GgxbRegion): string {
  const envKey = `GGXB_${region.toUpperCase()}_API_BASE_URL`;
  const fromEnv = process.env[envKey];
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return DEFAULT_API_BASE_URL[region];
}

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

const TEST_USER_ENV: Record<GgxbRegion, { email: string; password: string }> = {
  hk: {
    email: "GGXB_HK_TEST_USER_EMAIL",
    password: "GGXB_HK_TEST_USER_PASSWORD",
  },
  sg: {
    email: "GGXB_SG_TEST_USER_EMAIL",
    password: "GGXB_SG_TEST_USER_PASSWORD",
  },
};

export function ggxbTestUser(region: GgxbRegion): {
  email: string;
  password: string;
} {
  const keys = TEST_USER_ENV[region];
  const email = process.env[keys.email];
  const password = process.env[keys.password];
  if (!email || !password) {
    throw new Error(
      `Set ${keys.email} and ${keys.password} in the repo root .env file`,
    );
  }
  return { email, password };
}

/** HK account used by BET-4485 to place two transport orders in one browser. */
export function ggxbBet4485TestUser(): { email: string; password: string } {
  const email = process.env.GGXB_HK_BET_4485_USER_EMAIL;
  const password = process.env.GGXB_HK_BET_4485_USER_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set GGXB_HK_BET_4485_USER_EMAIL and GGXB_HK_BET_4485_USER_PASSWORD in the repo root .env file",
    );
  }
  return { email, password };
}

/** Low-wallet HK account for BET-4367 tip insufficient-balance coverage. */
export function ggxbBet4367TestUser(): { email: string; password: string } {
  const email = process.env.GGXB_HK_BET_4367_USER_EMAIL;
  const password = process.env.GGXB_HK_BET_4367_USER_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set GGXB_HK_BET_4367_USER_EMAIL and GGXB_HK_BET_4367_USER_PASSWORD in the repo root .env file",
    );
  }
  return { email, password };
}

const DA_USER_ENV: Record<GgxbRegion, { phone: string; password: string }> = {
  hk: {
    phone: "GGXB_HK_DA_USER_PHONE",
    password: "GGXB_HK_DA_USER_PASSWORD",
  },
  sg: {
    phone: "GGXB_SG_DA_USER_PHONE",
    password: "GGXB_SG_DA_USER_PASSWORD",
  },
};

export function ggxbDaUser(region: GgxbRegion): {
  phone: string;
  password: string;
} {
  const keys = DA_USER_ENV[region];
  const phone = process.env[keys.phone];
  const password = process.env[keys.password];
  if (!phone || !password) {
    throw new Error(
      `Set ${keys.phone} and ${keys.password} in the repo root .env file`,
    );
  }
  return { phone, password };
}

const ADMIN_BASE_URL_ENV: Record<GgxbRegion, string> = {
  hk: "GGXB_HK_ADMIN_BASE_URL",
  sg: "GGXB_SG_ADMIN_BASE_URL",
};

const DEFAULT_ADMIN_BASE_URL: Record<GgxbRegion, string> = {
  hk: "https://stag-hk.gogovan.tech/admin",
  sg: "https://stag-sg.gogovan.tech/admin",
};

export function ggxbAdminBaseUrl(region: GgxbRegion): string {
  const fromEnv = process.env[ADMIN_BASE_URL_ENV[region]];
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return DEFAULT_ADMIN_BASE_URL[region];
}

const ADMIN_USER_ENV: Record<GgxbRegion, { email: string; password: string }> =
  {
    hk: {
      email: "GGXB_HK_ADMIN_TEST_USER_EMAIL",
      password: "GGXB_HK_ADMIN_TEST_USER_PASSWORD",
    },
    sg: {
      email: "GGXB_SG_ADMIN_TEST_USER_EMAIL",
      password: "GGXB_SG_ADMIN_TEST_USER_PASSWORD",
    },
  };

export function ggxbAdminTestUser(region: GgxbRegion): {
  email: string;
  password: string;
} {
  const keys = ADMIN_USER_ENV[region];
  const email = process.env[keys.email];
  const password = process.env[keys.password];
  if (!email || !password) {
    throw new Error(
      `Set ${keys.email} and ${keys.password} in the repo root .env file`,
    );
  }
  return { email, password };
}
