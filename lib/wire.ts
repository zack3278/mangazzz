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
  const key = process.env.WIRE_SECRET_KEY;

  if (!key) {
    throw new Error("WIRE_SECRET_KEY тохируулаагүй байна");
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

export async function createWirePaymentIntent(input: WireCreatePaymentInput) {
  const secretKey = getWireSecretKey();

  const res = await fetch(`${WIRE_BASE_URL}/v1/payment_intents`, {
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

        // Khan Bank/QPay дээр гүйлгээний утга хэрэгтэй бол Wire connector талдаа
        // энэ metadata.remark-г invoice remark руу map хийлгэх шаардлагатай.
        remark: input.remark,
        description: input.remark,
        transactionRemark: input.remark,
      },
    }),
  });

  const data = await parseWireResponse(res);

  if (!res.ok) {
    console.error("Wire create payment intent failed:", data);

    throw new Error(
      typeof data === "object" && data?.error?.message
        ? data.error.message
        : "Wire payment үүсгэхэд алдаа гарлаа"
    );
  }

  return data as WirePaymentIntent;
}

export async function confirmWirePaymentIntent(paymentIntentId: string) {
  const secretKey = getWireSecretKey();
  const operator = process.env.WIRE_OPERATOR || "qpay";

  const res = await fetch(
    `${WIRE_BASE_URL}/v1/payment_intents/${paymentIntentId}/confirm`,
    {
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
    }
  );

  const data = await parseWireResponse(res);

  if (!res.ok) {
    console.error("Wire confirm payment intent failed:", data);

    throw new Error(
      typeof data === "object" && data?.error?.message
        ? data.error.message
        : "Wire payment confirm хийхэд алдаа гарлаа"
    );
  }

  return data as WirePaymentIntent;
}

export async function retrieveWirePaymentIntent(paymentIntentId: string) {
  const secretKey = getWireSecretKey();

  const res = await fetch(
    `${WIRE_BASE_URL}/v1/payment_intents/${paymentIntentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
    }
  );

  const data = await parseWireResponse(res);

  if (!res.ok) {
    console.error("Wire retrieve payment intent failed:", data);

    throw new Error(
      typeof data === "object" && data?.error?.message
        ? data.error.message
        : "Wire payment шалгахад алдаа гарлаа"
    );
  }

  return data as WirePaymentIntent;
}

export async function listWireChargesByPaymentIntent(paymentIntentId: string) {
  const secretKey = getWireSecretKey();

  const url = new URL(`${WIRE_BASE_URL}/v1/charges`);
  url.searchParams.set("payment_intent", paymentIntentId);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
    cache: "no-store",
  });

  const data = await parseWireResponse(res);

  if (!res.ok) {
    console.error("Wire list charges failed:", data);

    throw new Error(
      typeof data === "object" && data?.error?.message
        ? data.error.message
        : "Wire charge шалгахад алдаа гарлаа"
    );
  }

  return data as {
    object: "list";
    url: string;
    has_more: boolean;
    data: WireCharge[];
  };
}

export function isWirePaymentPaid(status?: string | null) {
  return status === "succeeded";
}

export function isWireChargePaid(status?: string | null) {
  return status === "succeeded";
}