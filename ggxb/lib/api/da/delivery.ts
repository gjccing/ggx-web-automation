import { ggxbApiBaseUrl, ggxbDaUser, type GgxbRegion } from "../../../env.js";

const DEFAULT_APP_ID: Record<GgxbRegion, string> = {
  hk: "hk.gogovan.GoGoDriver.staging",
  sg: "sg.gogovan.GoGoDriver.staging",
};

const DEFAULT_LOCALE: Record<GgxbRegion, string> = {
  hk: "en_HK",
  sg: "en_SG",
};

const DEFAULT_UDID = "5078B9E7-271F-4A87-8C3E-342A0EAC3DC2";

const DELIVERY_API_BASE: Record<GgxbRegion, string> = {
  hk: "https://stagdelivery.gogovan.com.hk/api/d2",
  sg: "https://stagdelivery.gogovan.com.sg/api/d2",
};

type DeliveryOrderSummary = {
  uuid?: string;
  tid?: string;
  status?: string;
};

function deliveryApiBase(region: GgxbRegion): string {
  const fromEnv = process.env[`GGXB_${region.toUpperCase()}_DP_DA_API_BASE_URL`];
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return DELIVERY_API_BASE[region];
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

/** Authorize driver app user against staging d2 (van booking host). */
export async function authorizeDaUser(region: GgxbRegion): Promise<string> {
  const { phone, password } = ggxbDaUser(region);
  const base = ggxbApiBaseUrl(region);
  const response = await fetch(`${base}/api/d2/user/authorize.json`, {
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
      `DA authorize failed (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  return body.access_token;
}

async function listDeliveryOrdersByStatus(
  region: GgxbRegion,
  accessToken: string,
  status: string,
): Promise<DeliveryOrderSummary[]> {
  const response = await fetch(
    `${deliveryApiBase(region)}/orders?status=${status}&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    },
  );
  const body = (await readJson(response)) as { orders?: DeliveryOrderSummary[] };
  if (!response.ok) {
    throw new Error(
      `List DP orders status=${status} failed (${response.status}): ${JSON.stringify(body)}`,
    );
  }
  return body.orders ?? [];
}

async function findPendingOrderUuidByTid(
  region: GgxbRegion,
  accessToken: string,
  tid: string,
  timeoutMs = 30_000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const orders = await listDeliveryOrdersByStatus(
      region,
      accessToken,
      "pending",
    );
    const match = orders.find((order) => order.tid === tid);
    if (match?.uuid) return match.uuid;
    await new Promise((r) => setTimeout(r, 2_000));
  }
  throw new Error(
    `Pending delivery order tid=${tid} not found in DA pending list within ${timeoutMs}ms`,
  );
}

async function patchDeliveryOrderAction(
  region: GgxbRegion,
  accessToken: string,
  uuid: string,
  body: Record<string, string>,
): Promise<DeliveryOrderSummary> {
  const response = await fetch(`${deliveryApiBase(region)}/orders/${uuid}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const parsed = (await readJson(response)) as DeliveryOrderSummary & {
    i18n_key?: string;
  };
  if (!response.ok) {
    throw new Error(
      `DA order_action=${body.order_action} failed for uuid=${uuid} (${response.status}): ${JSON.stringify(parsed)}`,
    );
  }
  return parsed;
}

/**
 * Accept a pending DP order via dp-d2:
 * `PATCH /api/d2/orders/{uuid}/` with `{ order_action: "accept" }`.
 */
export async function acceptDeliveryOrderByTid(
  region: GgxbRegion,
  tid: string,
): Promise<{ uuid: string; status: string }> {
  const accessToken = await authorizeDaUser(region);
  const uuid = await findPendingOrderUuidByTid(region, accessToken, tid);
  const body = await patchDeliveryOrderAction(region, accessToken, uuid, {
    order_action: "accept",
  });

  return {
    uuid,
    status: body.status ?? "accepted",
  };
}

/**
 * Pick up an accepted DP order via dp-d2:
 * `PATCH .../orders/{uuid}/` `{ order_action: "courier_pick_up", ref_code }`.
 */
export async function pickUpDeliveryOrderByUuid(
  region: GgxbRegion,
  uuid: string,
  pickUpCode: string,
): Promise<{ uuid: string; status: string }> {
  const accessToken = await authorizeDaUser(region);
  const body = await patchDeliveryOrderAction(region, accessToken, uuid, {
    order_action: "courier_pick_up",
    ref_code: pickUpCode,
  });
  return {
    uuid,
    status: body.status ?? "picked_up",
  };
}

/**
 * Complete a picked-up DP order via dp-d2:
 * `POST .../orders/{uuid}/tasks` multipart `{ order_action: "complete", drop_off_code }`.
 */
export async function completeDeliveryOrderByUuid(
  region: GgxbRegion,
  uuid: string,
  dropOffCode: string,
): Promise<{ uuid: string; status: string }> {
  const accessToken = await authorizeDaUser(region);

  const form = new FormData();
  form.append("order_action", "complete");
  form.append("drop_off_code", dropOffCode);
  const response = await fetch(
    `${deliveryApiBase(region)}/orders/${uuid}/tasks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: form,
    },
  );
  const body = (await readJson(response)) as DeliveryOrderSummary;
  if (!response.ok) {
    throw new Error(
      `DA complete failed for uuid=${uuid} (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  return {
    uuid,
    status: body.status ?? "completed",
  };
}

/** List the courier's in-progress DP orders (accepted / picked_up). */
export async function listInProgressDeliveryOrders(
  region: GgxbRegion,
): Promise<DeliveryOrderSummary[]> {
  const accessToken = await authorizeDaUser(region);
  return listDeliveryOrdersByStatus(region, accessToken, "in_progress");
}
