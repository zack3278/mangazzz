type WirePaymentIntent = {
  id: string;
  object: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
  automatic_operator?: boolean;
  allowed_operators?: string[];
  selected_operator?: string;
  next_action?: any;
  metadata?: any;
  livemode?: boolean;
  created?: number;
  expires_at?: number;
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

  /**
   * Wire docs дээр create body нь:
   * amount, currency, automatic_operator, allowed_operators, metadata гэж байна.
   * Тиймээс description/remark-г шууд root дээр явуулахгүй.
   *
   * Гүйлгээний утгыг metadata дотор хадгалж байна.
   * Хэрвээ Khan Bank дээр remark хоосон хэвээр байвал Wire/QPay connector талдаа
   * "invoice description / remark template" тохируулах шаардлагатай.
   */
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

export function isWirePaymentPaid(status?: string | null) {
  if (!status) return false;

  return [
    "paid",
    "succeeded",
    "success",
    "completed",
    "confirmed",
  ].includes(status.toLowerCase());
}