import { NextResponse } from "next/server";

type PremiumPlan = {
  months: number;
  amount: number;
};

const PLANS: PremiumPlan[] = [
  { months: 1, amount: 5000 },
  { months: 2, amount: 9000 },
  { months: 3, amount: 13000 },
  { months: 6, amount: 22000 },
  { months: 12, amount: 35000 },
];

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `mangazet-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getPaymentUrl(data: any) {
  return (
    data?.checkoutUrl ||
    data?.checkout_url ||
    data?.paymentUrl ||
    data?.payment_url ||
    data?.invoiceUrl ||
    data?.invoice_url ||
    data?.redirectUrl ||
    data?.redirect_url ||
    data?.url ||
    data?.next_action?.url ||
    data?.next_action?.payment_url ||
    data?.next_action?.redirect_url ||
    data?.next_action?.redirect_to_url ||
    data?.next_action?.deeplink ||
    data?.next_action?.deep_link ||
    data?.data?.checkoutUrl ||
    data?.data?.checkout_url ||
    data?.data?.paymentUrl ||
    data?.data?.payment_url ||
    data?.data?.invoiceUrl ||
    data?.data?.invoice_url ||
    data?.data?.redirectUrl ||
    data?.data?.redirect_url ||
    data?.data?.url ||
    data?.data?.next_action?.url ||
    data?.data?.next_action?.payment_url ||
    data?.data?.next_action?.redirect_url ||
    data?.data?.next_action?.redirect_to_url ||
    data?.data?.next_action?.deeplink ||
    data?.data?.next_action?.deep_link ||
    null
  );
}

function getQrText(data: any) {
  return (
    data?.qrText ||
    data?.qr_text ||
    data?.qpayQrText ||
    data?.qpay_qr_text ||
    data?.qr ||
    data?.next_action?.qrText ||
    data?.next_action?.qr_text ||
    data?.next_action?.qpayQrText ||
    data?.next_action?.qpay_qr_text ||
    data?.next_action?.qr ||
    data?.data?.qrText ||
    data?.data?.qr_text ||
    data?.data?.qpayQrText ||
    data?.data?.qpay_qr_text ||
    data?.data?.qr ||
    data?.data?.next_action?.qrText ||
    data?.data?.next_action?.qr_text ||
    data?.data?.next_action?.qpayQrText ||
    data?.data?.next_action?.qpay_qr_text ||
    data?.data?.next_action?.qr ||
    null
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const months = Number(body.months);
    const amount = Number(body.amount);

    const plan = PLANS.find(
      (item) => item.months === months && item.amount === amount
    );

    if (!plan) {
      return NextResponse.json(
        { message: "Premium plan буруу байна" },
        { status: 400 }
      );
    }

    const WIRE_API_KEY = process.env.WIRE_API_KEY;
    const WIRE_OPERATOR = process.env.WIRE_OPERATOR;
    const SITE_URL =
      process.env.NEXT_PUBLIC_SITE_URL || "https://mangazet.site";

    const createUrl =
      process.env.WIRE_PAYMENT_CREATE_URL ||
      "https://api.wirepayment.mn/v1/payment_intents";

    if (!WIRE_API_KEY) {
      return NextResponse.json(
        {
          message: "WIRE_API_KEY env дутуу байна",
          missing: {
            WIRE_API_KEY: true,
          },
        },
        { status: 500 }
      );
    }

    if (!createUrl.startsWith("https://")) {
      return NextResponse.json(
        {
          message: "WIRE_PAYMENT_CREATE_URL буруу байна",
          createUrl,
          correct: "https://api.wirepayment.mn/v1/payment_intents",
        },
        { status: 500 }
      );
    }

    const orderId = `MANGAZET-${Date.now()}-${plan.months}`;

    const createPayload = {
      amount: plan.amount,
      currency: "MNT",
      automatic_operator: true,
      allowed_operators: [],
      metadata: {
        orderId,
        months: plan.months,
        amount: plan.amount,
        site: "Mangazet",
        returnUrl: `${SITE_URL}/premium/success`,
      },
    };

    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WIRE_API_KEY}`,
        "Idempotency-Key": makeIdempotencyKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createPayload),
      cache: "no-store",
    });

    const createText = await createRes.text();

    let createData: any;

    try {
      createData = JSON.parse(createText);
    } catch {
      createData = { raw: createText };
    }

    if (!createRes.ok) {
      return NextResponse.json(
        {
          message: "Wire.mn PaymentIntent үүсгэхэд алдаа гарлаа",
          status: createRes.status,
          createUrl,
          data: createData,
        },
        { status: createRes.status }
      );
    }

    const paymentIntentId = createData?.id || createData?.data?.id;

    if (!paymentIntentId) {
      return NextResponse.json(
        {
          message: "Wire.mn PaymentIntent ID олдсонгүй",
          createUrl,
          data: createData,
        },
        { status: 500 }
      );
    }

    const confirmUrl = `https://api.wirepayment.mn/v1/payment_intents/${paymentIntentId}/confirm`;

    const confirmPayload: any = {
      return_url: `${SITE_URL}/premium/success`,
    };

    if (WIRE_OPERATOR) {
      confirmPayload.operator = WIRE_OPERATOR;
    }

    const confirmRes = await fetch(confirmUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WIRE_API_KEY}`,
        "Idempotency-Key": makeIdempotencyKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(confirmPayload),
      cache: "no-store",
    });

    const confirmText = await confirmRes.text();

    let confirmData: any;

    try {
      confirmData = JSON.parse(confirmText);
    } catch {
      confirmData = { raw: confirmText };
    }

    if (!confirmRes.ok) {
      return NextResponse.json(
        {
          message: "Wire.mn PaymentIntent confirm хийхэд алдаа гарлаа",
          status: confirmRes.status,
          createData,
          confirmData,
        },
        { status: confirmRes.status }
      );
    }

    const paymentUrl = getPaymentUrl(confirmData) || getPaymentUrl(createData);
    const qrText = getQrText(confirmData) || getQrText(createData);

    return NextResponse.json({
      message: "Wire payment үүслээ",
      orderId,
      paymentIntentId,
      paymentUrl,
      checkoutUrl: paymentUrl,
      qrText,
      createData,
      confirmData,
    });
  } catch (error: any) {
    console.error("WIRE FETCH ERROR:", error);

    return NextResponse.json(
      {
        message: "Wire.mn API холболт амжилтгүй боллоо",
        error: error?.message || String(error),
        cause: error?.cause
          ? {
              code: error.cause?.code,
              errno: error.cause?.errno,
              syscall: error.cause?.syscall,
              hostname: error.cause?.hostname,
            }
          : null,
      },
      { status: 500 }
    );
  }
}