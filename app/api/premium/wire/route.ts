import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createWireCheckoutSession,
  createWirePaymentIntent,
  getWirePaymentUrl,
  getWireQrText,
} from "@/lib/wire";

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

function getAllowedOperators() {
  const raw = process.env.WIRE_ALLOWED_OPERATORS?.trim();

  if (raw) {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (process.env.WIRE_API_KEY?.startsWith("sk_test_")) {
    return ["sandbox"];
  }

  return undefined;
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Premium авахын тулд эхлээд нэвтэрнэ үү" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { message: "Буруу хүсэлт байна" },
        { status: 400 }
      );
    }

    const months = Number(body.months);
    const clientAmount = Number(body.amount);

    const plan = PLANS.find((item) => item.months === months);

    if (!plan) {
      return NextResponse.json(
        { message: "Premium plan буруу байна" },
        { status: 400 }
      );
    }

    if (
      Number.isFinite(clientAmount) &&
      clientAmount > 0 &&
      clientAmount !== plan.amount
    ) {
      return NextResponse.json(
        { message: "Төлбөрийн дүн plan-тай таарахгүй байна" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Хэрэглэгч олдсонгүй" },
        { status: 404 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://mangazet.site";

    const invoiceId = `MANGAZET-${user.id}-${Date.now()}-${plan.months}`;

    const order = await prisma.premiumOrder.create({
      data: {
        userId: user.id,
        months: plan.months,
        amount: plan.amount,
        status: "PENDING",
        invoiceId,
      },
    });

    const paymentIntent = await createWirePaymentIntent({
      amount: plan.amount,
      orderId: order.id,
      userId: user.id,
      months: plan.months,
      remark: `Mangazet Premium ${plan.months} сар`,
      automatic_operator: true,
      allowed_operators: getAllowedOperators(),
      metadata: {
        invoiceId,
        site: "Mangazet",
        email: user.email,
        name: user.name,
        returnUrl: `${siteUrl}/premium?orderId=${order.id}`,
      },
    });

    const paymentIntentId =
      paymentIntent?.id || (paymentIntent as any)?.data?.id || null;

    if (!paymentIntentId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Wire.mn PaymentIntent ID олдсонгүй",
          paymentIntent,
        },
        { status: 500 }
      );
    }

    const checkoutSession = await createWireCheckoutSession({
      paymentIntentId,
      successUrl: `${siteUrl}/premium?payment=success&orderId=${order.id}`,
      cancelUrl: `${siteUrl}/premium?payment=cancel&orderId=${order.id}`,
      idempotencyKey: `mangazet-checkout-${order.id}`,
    });

    const paymentUrl =
      getWirePaymentUrl(checkoutSession) || getWirePaymentUrl(paymentIntent);

    const qrText =
      getWireQrText(checkoutSession) || getWireQrText(paymentIntent);

    await prisma.premiumOrder.update({
      where: { id: order.id },
      data: {
        wirePaymentIntentId: paymentIntentId,
        wireClientSecret: paymentIntent.client_secret || null,
        wireStatus: paymentIntent.status || null,
        wireNextAction: paymentIntent.next_action
          ? JSON.stringify(paymentIntent.next_action)
          : null,
        qrText: qrText || null,
      },
    });

    if (!paymentUrl && !qrText) {
      return NextResponse.json(
        {
          ok: false,
          message: "Wire.mn checkout үүссэн боловч payment URL эсвэл QR ирсэнгүй",
          orderId: order.id,
          invoiceId,
          paymentIntentId,
          amount: plan.amount,
          months: plan.months,
          paymentIntent,
          checkoutSession,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Wire.mn checkout URL үүслээ",
      orderId: order.id,
      invoiceId,
      paymentIntentId,
      paymentUrl,
      checkoutUrl: paymentUrl,
      qrText,
      amount: plan.amount,
      months: plan.months,
      status: paymentIntent.status || null,
      paymentIntent,
      checkoutSession,
    });
  } catch (error: any) {
    console.error("Create Wire checkout error:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Wire.mn checkout үүсгэхэд серверийн алдаа гарлаа",
        status: error?.status || null,
        data: error?.data || null,
        cause: error?.cause
          ? {
              code: error.cause?.code,
              errno: error.cause?.errno,
              syscall: error.cause?.syscall,
              hostname: error.cause?.hostname,
            }
          : null,
        correctWireApiUrl: "https://api.wire.mn/v1",
        missing: {
          WIRE_API_KEY: !process.env.WIRE_API_KEY,
          WIRE_API_URL: !process.env.WIRE_API_URL,
        },
      },
      { status: error?.status || 500 }
    );
  }
}