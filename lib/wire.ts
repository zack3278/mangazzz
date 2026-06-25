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
  object: "payment_intent";
  amount: number;
  currency: string;
  status: WirePaymentIntentStatus;
  client_secret: string;
  automatic_operator: boolean;
  allowed_operators: string[];
  selected_operator: string | null;
  next_action: any | null;
  metadata: Record<string, any>;
  livemode: boolean;
  created: number;
  expires_at: number | null;
};

export type WireChargeStatus = "pending" | "succeeded" | "failed";

export type WireCharge = {
  id: string;
  object: "charge";
  payment_intent: string;
  operator: string;
  operator_charge_id: string | null;
  status: WireChargeStatus;
  amount: number;
  fee: number;
  amount_refunded: number;
  failure_code: string | null;
  failure_message: string | null;
  livemode: boolean;
  created: number;
};

type WireCreatePaymentInput = {
  amount: number;
  orderId: number;
  userId: number;
  months: number;
  remark: string;
};

const WIRE_BASE_URL =
  process.env.WIRE_BASE_URL || "https://api.wirepayment.mn";

function getWireSecretKey() {
  const key = process.env.WIRE_SECRET_KEY || process.env.WIRE_API_KEY;

  if (!key) {
    throw new Error("WIRE_SECRET_KEY эсвэл WIRE_API_KEY тохируулаагүй байна");
  }

  return key;
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

export async function wireRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const secretKey = getWireSecretKey();

  const url = path.startsWith("http")
    ? path
    : `${WIRE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await safeFetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const data = await parseWireResponse(res);

  if (!res.ok) {
    console.error("Wire request failed:", data);

    throw new Error(
      typeof data === "object" && data?.error?.message
        ? data.error.message
        : `Wire request алдаа гарлаа. Status: ${res.status}`
    );
  }

  return data as T;
}

export async function createWirePaymentIntent(input: WireCreatePaymentInput) {
  const secretKey = getWireSecretKey();

  const url = `${WIRE_BASE_URL}/v1/payment_intents`;

  const res = await safeFetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `mangazet-order-${input.orderId}`,
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: "MNT",
      automatic_operator: false,
      allowed_operators: [],

      metadata: {
        orderId: input.orderId,
        userId: input.userId,
        months: input.months,
        amount: input.amount,
        remark: input.remark,
        description: input.remark,
        transactionRemark: input.remark,
      },
    }),
    cache: "no-store",
  });

  const data = await parseWireResponse(res);

  if (!res.ok) {
    console.error("Wire create payment intent failed:", data);

    throw new Error(
      typeof data === "object" && data?.error?.message
        ? data.error.message
        : `Wire payment үүсгэхэд алдаа гарлаа. Status: ${res.status}`
    );
  }

  return data as WirePaymentIntent;
}

export async function confirmWirePaymentIntent(paymentIntentId: string) {
  const secretKey = getWireSecretKey();
  const operator = process.env.WIRE_OPERATOR || "qpay";

  const url = `${WIRE_BASE_URL}/v1/payment_intents/${paymentIntentId}/confirm`;

  const res = await safeFetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `mangazet-confirm-${paymentIntentId}`,
    },
    body: JSON.stringify({
      operator,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/premium`,
    }),
    cache: "no-store",
  });

  const data = await parseWireResponse(res);

  if (!res.ok) {
    console.error("Wire confirm payment intent failed:", data);

    throw new Error(
      typeof data === "object" && data?.error?.message
        ? data.error.message
        : `Wire payment confirm хийхэд алдаа гарлаа. Status: ${res.status}`
    );
  }

  return data as WirePaymentIntent;
}

export async function retrieveWirePaymentIntent(paymentIntentId: string) {
  return wireRequest<WirePaymentIntent>(
    `/v1/payment_intents/${paymentIntentId}`,
    {
      method: "GET",
    }
  );
}

export async function listWireChargesByPaymentIntent(paymentIntentId: string) {
  const url = `/v1/charges?payment_intent=${encodeURIComponent(
    paymentIntentId
  )}`;

  return wireRequest<{
    object: "list";
    url: string;
    has_more: boolean;
    data: WireCharge[];
  }>(url, {
    method: "GET",
  });
}

export function isWirePaymentPaid(status?: string | null) {
  return status === "succeeded";
}

export function isWireChargePaid(status?: string | null) {
  return status === "succeeded";
}