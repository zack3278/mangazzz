const WIRE_API_URL = "https://api.wirepayment.mn";

type WireRequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  idempotencyKey?: string;
};

export type WirePaymentIntent = {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: "MNT";
  status: string;
  client_secret?: string;
  automatic_operator?: boolean;
  allowed_operators?: string[];
  selected_operator?: string;
  next_action?: unknown;
  metadata?: Record<string, unknown>;
  livemode?: boolean;
  created?: number;
  expires_at?: number;
};

export async function wireRequest<T>(
  path: string,
  options: WireRequestOptions = {}
): Promise<T> {
  const apiKey = process.env.WIRE_API_KEY;

  if (!apiKey) {
    throw new Error("WIRE_API_KEY тохируулаагүй байна");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  const res = await fetch(`${WIRE_API_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("Wire API error:", data);
    throw new Error(data?.error?.message || "Wire API request failed");
  }

  return data as T;
}