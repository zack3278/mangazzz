import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPremiumPlan } from "@/lib/premium";
import {
  createWireCheckoutSession,
  createWirePaymentIntent,
  getWirePaymentUrl,
  getWireQrText,
} from "@/lib/wire";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);

    if (!userId) {
      return NextResponse.json(
        { message: "Эхлээд нэвтэрнэ үү" },
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
    const plan = getPremiumPlan(months);

    if (!plan) {
      return NextResponse.json(
        { message: "Premium plan буруу байна" },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://mangazet.site";

    const invoiceId = `MANGAZET-${userId}-${Date.now()}-${plan.months}`;

    const order = await prisma.premiumOrder.create({
      data: {
        userId,
        months: plan.months,
        amount: plan.amount,
        status: "PENDING",
        invoiceId,
      },
    });

    const paymentIntent = await createWirePaymentIntent({
      amount: plan.amount,
      orderId: order.id,
      userId,
      months: plan.months,
      remark: `Mangazet Premium ${plan.months} сар`,
      automatic_operator: true,
      metadata: {
        invoiceId,
        site: "Mangazet",
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
        missing: {
          WIRE_API_KEY: !process.env.WIRE_API_KEY,
          WIRE_API_URL: !process.env.WIRE_API_URL,
        },
      },
      { status: error?.status || 500 }
    );
  }
}