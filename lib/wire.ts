export type WirePaymentIntentStatus =
  | "new"
  | "requires_payment_method"
  | "requires_action"
  | "requires_capture"
  | "processing"
  | "succeeded"
  | "canceled";

export type WirePaymentIntent = {
  id: string;
  object?: "payment_intent" | string;
  amount?: number;
  currency?: string;
  status: WirePaymentIntentStatus | string;
  client_secret?: string;
  automatic_operator?: boolean;
  allowed_operators?: string[];
  selected_operator?: string | null;
  next_action?: any | null;
  metadata?: Record<string, unknown>;
  livemode?: boolean;
  created?: number;
  expires_at?: number | null;
};

export type WireChargeStatus = "pending" | "succeeded" | "failed";

export type WireCharge = {
  id: string;
  object?: "charge" | string;
  payment_intent?: string;
  operator?: string;
  operator_charge_id?: string | null;
  status: WireChargeStatus | string;
  amount?: number;
  fee?: number;
  amount_refunded?: number;
  failure_code?: string | null;
  failure_message?: string | null;
  livemode?: boolean;
  created?: number;
};

export type WireList<T> = {
  object?: "list" | string;
  url?: string;
  has_more?: boolean;
  data: T[];
};

export type WireCheckoutSession = {
  id?: string;
  object?: "checkout.session" | string;
  url?: string;
  payment_url?: string;
  checkout_url?: string;
  payment_intent?: string;
  data?: any;
};

type WireCreatePaymentInput = {
  amount: number;
  orderId?: number | string;
  userId?: number | string;
  months?: number;
  remark?: string;
  metadata?: Record<string, unknown>;
  automatic_operator?: boolean;
  allowed_operators?: string[];
};

const DEFAULT_WIRE_API_URL = "https://api.wire.mn/v1";

function normalizeWireApiUrl(value?: string) {
  const raw = value?.trim();

  if (!raw) {
    return DEFAULT_WIRE_API_URL;
  }

  if (raw.includes("wirepayment.mn")) {
    console.warn(
      `Буруу Wire URL илэрлээ: ${raw}. ${DEFAULT_WIRE_API_URL} ашиглаж байна.`
    );

    return DEFAULT_WIRE_API_URL;
  }

  const clean = raw.replace(/\/+$/, "");

  if (clean === "https://api.wire.mn") {
    return `${clean}/v1`;
  }

  return clean;
}

export function getWireApiUrl() {
  return normalizeWireApiUrl(
    process.env.WIRE_API_URL || process.env.WIRE_BASE_URL
  );
}

export function getWireSecretKey() {
  const key = process.env.WIRE_API_KEY || process.env.WIRE_SECRET_KEY;

  if (!key) {
    throw new Error("WIRE_API_KEY env дутуу байна");
  }

  return key.trim();
}

async function parseWireResponse(res: Response) {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

async function safeFetch(url: string, options: RequestInit) {
  try {
    return await fetch(url, options);
  } catch (error) {
    console.error("Wire fetch failed:", {
      url,
      message: error instanceof Error ? error.message : String(error),
      cause:
        error instanceof Error && "cause" in error
          ? (error as any).cause
          : null,
    });

    throw new Error(
      `Wire.mn API холболт амжилтгүй боллоо: ${
        error instanceof Error ? error.message : "fetch failed"
      }`
    );
  }
}

export async function wireRequest<T>(
  path: string,
  options: RequestInit & { idempotencyKey?: string } = {}
): Promise<T> {
  const secretKey = getWireSecretKey();
  const baseUrl = getWireApiUrl();

  const url = path.startsWith("http")
    ? path
    : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${secretKey}`);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.idempotencyKey) {
    headers.set("Idempotency-Key", options.idempotencyKey);
  }

  const { idempotencyKey, ...fetchOptions } = options;

  const res = await safeFetch(url, {
    ...fetchOptions,
    headers,
    cache: "no-store",
  });

  const data = await parseWireResponse(res);

  if (!res.ok) {
    console.error("Wire request failed:", data);

    let message = `Wire request алдаа гарлаа. Status: ${res.status}`;

    if (typeof data === "object" && data !== null) {
      const anyData = data as any;

      message =
        anyData?.error?.message ||
        anyData?.message ||
        anyData?.failure_message ||
        message;
    }

    const err = new Error(message) as Error & {
      status?: number;
      data?: unknown;
    };

    err.status = res.status;
    err.data = data;

    throw err;
  }

  return data as T;
}

export async function createWirePaymentIntent(input: WireCreatePaymentInput) {
  const metadata: Record<string, unknown> = {
    ...(input.orderId !== undefined ? { orderId: String(input.orderId) } : {}),
    ...(input.userId !== undefined ? { userId: String(input.userId) } : {}),
    ...(input.months !== undefined ? { months: String(input.months) } : {}),
    ...(input.remark ? { remark: input.remark } : {}),
    ...(input.metadata || {}),
  };

  const payload: Record<string, unknown> = {
    amount: input.amount,
    currency: "MNT",
    automatic_operator: input.automatic_operator ?? true,
    metadata,
  };

  if (input.allowed_operators && input.allowed_operators.length > 0) {
    payload.allowed_operators = input.allowed_operators;
  }

  return wireRequest<WirePaymentIntent>("/payment_intents", {
    method: "POST",
    idempotencyKey: `mangazet-create-${input.orderId || Date.now()}`,
    body: JSON.stringify(payload),
  });
}

export async function createWireCheckoutSession(input: {
  paymentIntentId: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey?: string;
}) {
  if (!input.paymentIntentId) {
    throw new Error("Wire paymentIntentId дутуу байна");
  }

  const jsonPayload = {
    payment_intent: input.paymentIntentId,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };

  try {
    return await wireRequest<WireCheckoutSession>("/checkout/sessions", {
      method: "POST",
      idempotencyKey:
        input.idempotencyKey || `checkout-json-${input.paymentIntentId}`,
      body: JSON.stringify(jsonPayload),
    });
  } catch (jsonError: any) {
    console.warn("Wire checkout JSON request failed. Retrying as form data.", {
      message: jsonError?.message,
      status: jsonError?.status,
      data: jsonError?.data,
    });

    const formPayload = new URLSearchParams();
    formPayload.set("payment_intent", input.paymentIntentId);
    formPayload.set("success_url", input.successUrl);
    formPayload.set("cancel_url", input.cancelUrl);

    return wireRequest<WireCheckoutSession>("/checkout/sessions", {
      method: "POST",
      idempotencyKey:
        input.idempotencyKey || `checkout-form-${input.paymentIntentId}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formPayload,
    });
  }
}

export async function retrieveWirePaymentIntent(paymentIntentId: string) {
  if (!paymentIntentId) {
    throw new Error("Wire paymentIntentId дутуу байна");
  }

  return wireRequest<WirePaymentIntent>(
    `/payment_intents/${encodeURIComponent(paymentIntentId)}`,
    {
      method: "GET",
    }
  );
}

export async function listWireChargesByPaymentIntent(paymentIntentId: string) {
  if (!paymentIntentId) {
    throw new Error("Wire paymentIntentId дутуу байна");
  }

  return wireRequest<WireList<WireCharge>>(
    `/charges?payment_intent=${encodeURIComponent(paymentIntentId)}`,
    {
      method: "GET",
    }
  );
}

export function isWirePaymentPaid(status?: string | null) {
  return status === "succeeded";
}

export function isWireChargePaid(status?: string | null) {
  return status === "succeeded";
}

function findFirstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

export function getWirePaymentUrl(data: any) {
  return findFirstString(
    data?.url,
    data?.checkoutUrl,
    data?.checkout_url,
    data?.paymentUrl,
    data?.payment_url,
    data?.invoiceUrl,
    data?.invoice_url,
    data?.redirectUrl,
    data?.redirect_url,

    data?.data?.url,
    data?.data?.checkoutUrl,
    data?.data?.checkout_url,
    data?.data?.paymentUrl,
    data?.data?.payment_url,
    data?.data?.invoiceUrl,
    data?.data?.invoice_url,
    data?.data?.redirectUrl,
    data?.data?.redirect_url,

    data?.next_action?.url,
    data?.next_action?.checkoutUrl,
    data?.next_action?.checkout_url,
    data?.next_action?.paymentUrl,
    data?.next_action?.payment_url,
    data?.next_action?.redirectUrl,
    data?.next_action?.redirect_url,
    data?.next_action?.redirect_to_url,
    data?.next_action?.deeplink,
    data?.next_action?.deep_link,

    data?.data?.next_action?.url,
    data?.data?.next_action?.checkoutUrl,
    data?.data?.next_action?.checkout_url,
    data?.data?.next_action?.paymentUrl,
    data?.data?.next_action?.payment_url,
    data?.data?.next_action?.redirectUrl,
    data?.data?.next_action?.redirect_url,
    data?.data?.next_action?.redirect_to_url,
    data?.data?.next_action?.deeplink,
    data?.data?.next_action?.deep_link
  );
}

export function getWireQrText(data: any) {
  return findFirstString(
    data?.qrText,
    data?.qr_text,
    data?.qpayQrText,
    data?.qpay_qr_text,
    data?.qr,

    data?.data?.qrText,
    data?.data?.qr_text,
    data?.data?.qpayQrText,
    data?.data?.qpay_qr_text,
    data?.data?.qr,

    data?.next_action?.qrText,
    data?.next_action?.qr_text,
    data?.next_action?.qpayQrText,
    data?.next_action?.qpay_qr_text,
    data?.next_action?.qr,

    data?.data?.next_action?.qrText,
    data?.data?.next_action?.qr_text,
    data?.data?.next_action?.qpayQrText,
    data?.data?.next_action?.qpay_qr_text,
    data?.data?.next_action?.qr
  );
}