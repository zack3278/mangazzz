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

function getPaymentUrl(data: any) {
  return (
    data?.checkoutUrl ||
    data?.paymentUrl ||
    data?.payment_url ||
    data?.invoiceUrl ||
    data?.invoice_url ||
    data?.redirectUrl ||
    data?.redirect_url ||
    data?.url ||
    data?.data?.checkoutUrl ||
    data?.data?.paymentUrl ||
    data?.data?.payment_url ||
    data?.data?.invoiceUrl ||
    data?.data?.invoice_url ||
    data?.data?.redirectUrl ||
    data?.data?.redirect_url ||
    data?.data?.url ||
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
    const WIRE_SECRET_KEY = process.env.WIRE_SECRET_KEY;
    const WIRE_OPERATOR = process.env.WIRE_OPERATOR;
    const WIRE_PAYMENT_CREATE_URL = process.env.WIRE_PAYMENT_CREATE_URL;
    const WIRE_API_URL = process.env.WIRE_API_URL;
    const WIRE_BASE_URL = process.env.WIRE_BASE_URL;

    const SITE_URL =
      process.env.NEXT_PUBLIC_SITE_URL || "https://mangazet.site";

    const createUrl =
      WIRE_PAYMENT_CREATE_URL ||
      (WIRE_API_URL ? `${WIRE_API_URL}/payment/create` : "") ||
      (WIRE_BASE_URL ? `${WIRE_BASE_URL}/payment/create` : "");

    if (!WIRE_API_KEY || !WIRE_SECRET_KEY || !WIRE_OPERATOR || !createUrl) {
      return NextResponse.json(
        {
          message: "Wire.mn ENV дутуу байна",
          missing: {
            WIRE_API_KEY: !WIRE_API_KEY,
            WIRE_SECRET_KEY: !WIRE_SECRET_KEY,
            WIRE_OPERATOR: !WIRE_OPERATOR,
            WIRE_PAYMENT_CREATE_URL_OR_BASE_URL: !createUrl,
          },
        },
        { status: 500 }
      );
    }

    const orderId = `MANGAZET-${Date.now()}-${plan.months}`;

    const payload = {
      amount: plan.amount,
      totalAmount: plan.amount,
      currency: "MNT",
      description: `Mangazet Premium ${plan.months} сар`,
      orderId,
      invoiceId: orderId,
      operator: WIRE_OPERATOR,
      callbackUrl: `${SITE_URL}/api/premium/wire/webhook`,
      successUrl: `${SITE_URL}/premium/success`,
      cancelUrl: `${SITE_URL}/premium`,
      returnUrl: `${SITE_URL}/premium/success`,
      metadata: {
        months: plan.months,
        site: "Mangazet",
      },
    };

    const wireRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        // Wire.mn docs аль header нэрийг ашиглаж байгаагаас шалтгаалаад
        // доорх хэд хэдэн хувилбарыг зэрэг явуулж байна.
        Authorization: `Bearer ${WIRE_API_KEY}`,
        "x-api-key": WIRE_API_KEY,
        "api-key": WIRE_API_KEY,
        "secret-key": WIRE_SECRET_KEY,
        "x-secret-key": WIRE_SECRET_KEY,
        operator: WIRE_OPERATOR,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await wireRes.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!wireRes.ok) {
      return NextResponse.json(
        {
          message: "Wire.mn API error",
          status: wireRes.status,
          createUrl,
          data,
        },
        { status: wireRes.status }
      );
    }

    const paymentUrl = getPaymentUrl(data);

    return NextResponse.json({
      message: "Wire payment үүслээ",
      orderId,
      paymentUrl,
      checkoutUrl: paymentUrl,
      data,
    });
  } catch (error: any) {
    console.error("WIRE FETCH ERROR:", error);

    return NextResponse.json(
      {
        message: "Wire.mn API холболт амжилтгүй боллоо",
        error: error?.message || String(error),
        cause: error?.cause || null,
      },
      { status: 500 }
    );
  }
}