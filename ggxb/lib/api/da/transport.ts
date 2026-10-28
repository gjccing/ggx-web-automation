import { ggxbApiBaseUrl, ggxbTransportDriver, type GgxbRegion } from "../../../env.js";

const DEFAULT_APP_ID: Record<GgxbRegion, string> = {
  hk: "hk.gogovan.GoGoDriver.staging",
  sg: "sg.gogovan.GoGoDriver.staging",
};

const DEFAULT_LOCALE: Record<GgxbRegion, string> = {
  hk: "en_HK",
  sg: "en_SG",
};

const DEFAULT_UDID = "5078B9E7-271F-4A87-8C3E-342A0EAC3DC2";

export type TransportOrderRef = {
  id: number;
  uuid: string;
};

type OrderStatusBody = {
  status?: string;
  order_request?: { status?: string };
  i18n_key?: string;
};

function vanD2Url(region: GgxbRegion, path: string): string {
  const base = ggxbApiBaseUrl(region);
  return `${base}/api/d2${path}`;
}

async function readJson(response: Response): Promise<unknown> {
  const raw = await response.text();
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(
      `Non-JSON response (${response.status}): ${raw.slice(0, 500)}`,
    );
  }
}

function readStatus(body: OrderStatusBody): string | undefined {
  return body.status ?? body.order_request?.status;
}

/** Authorize a transport driver against staging van d2 (not dp-d2). */
export async function authorizeTransportDriver(
  region: GgxbRegion,
): Promise<string> {
  const { phone, password } = ggxbTransportDriver(region);
  const response = await fetch(vanD2Url(region, "/user/authorize.json"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
    },
    body: JSON.stringify({
      phone_number: phone,
      password,
      appId: DEFAULT_APP_ID[region],
      locale: DEFAULT_LOCALE[region],
      udid: process.env.GGXB_DA_UDID ?? DEFAULT_UDID,
    }),
  });

  const body = (await readJson(response)) as {
    access_token?: string;
    i18n_key?: string;
  };

  if (!response.ok || !body.access_token) {
    throw new Error(
      `Transport driver authorize failed (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  return body.access_token;
}

/** `driver_offline` rejects the claim. Idempotent if the driver is already online. */
async function setTransportDriverOnline(
  region: GgxbRegion,
  accessToken: string,
): Promise<void> {
  const response = await fetch(vanD2Url(region, "/user/status.json"), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ status: "online" }),
  });

  const body = await readJson(response);
  if (!response.ok) {
    throw new Error(
      `Transport driver online failed (${response.status}): ${JSON.stringify(body)}`,
    );
  }
}

/**
 * `PATCH /api/d2/order/order_request/{uuid}` with DriverAuth.
 * Body requires numeric `id` and `status` (d2.yaml).
 */
async function patchTransportOrderStatus(
  region: GgxbRegion,
  accessToken: string,
  order: TransportOrderRef,
  status: "picked" | "active",
): Promise<string> {
  const response = await fetch(
    vanD2Url(
      region,
      `/order/order_request/${encodeURIComponent(order.uuid)}.json`,
    ),
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ id: order.id, status }),
    },
  );

  const body = (await readJson(response)) as OrderStatusBody;
  if (!response.ok) {
    throw new Error(
      `Transport order ${order.uuid} status=${status} failed (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  const actual = readStatus(body);
  if (!actual) {
    throw new Error(
      `Transport order ${order.uuid} status=${status} returned no status: ${JSON.stringify(body)}`,
    );
  }
  if (actual !== status) {
    throw new Error(
      `Transport order ${order.uuid} expected status ${status}, got ${actual}`,
    );
  }
  return actual;
}

/**
 * Claim then confirm a pending transport order so it has an assigned driver.
 * `pending → picked` (driver grabs the order), then `picked → active` (driver confirms).
 */
export async function acceptTransportOrderToActive(
  region: GgxbRegion,
  order: TransportOrderRef,
): Promise<{ id: number; uuid: string; status: string }> {
  const accessToken = await authorizeTransportDriver(region);
  await setTransportDriverOnline(region, accessToken);
  await patchTransportOrderStatus(region, accessToken, order, "picked");
  const status = await patchTransportOrderStatus(
    region,
    accessToken,
    order,
    "active",
  );

  return {
    id: order.id,
    uuid: order.uuid,
    status,
  };
}
