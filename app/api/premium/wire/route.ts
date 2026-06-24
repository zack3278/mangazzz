import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPremiumPlan, isValidPremiumMonths } from "@/lib/premium";
import { wireRequest, WirePaymentIntent } from "@/lib/wire";

function getWireRedirectUrl(nextAction: unknown): string | null {
  if (!nextAction) return null;

  if (typeof nextAction === "string") {
    if (nextAction.startsWith("http")) return nextAction;
    return null;
  }

  if (typeof nextAction !== "object") return null;

  const action = nextAction as any;

  return (
    action.url ||
    action.redirect_url ||
    action.redirectUrl ||
    action.checkout_url ||
    action.checkoutUrl ||
    action.payment_url ||
    action.paymentUrl ||
    action.deeplink ||
    action.deep_link ||
    action.qpay_url ||
    action.qpayUrl ||
    null
  );
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Эхлээд login хийнэ үү" },
        { status: 401 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      return NextResponse.json(
        { message: "NEXT_PUBLIC_SITE_URL env тохируулаагүй байна" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const months = Number(body.months);

    if (!isValidPremiumMonths(months)) {
      return NextResponse.json(
        { message: "Premium plan буруу байна" },
        { status: 400 }
      );
    }

    const plan = getPremiumPlan(months);

    if (!plan) {
      return NextResponse.json(
        { message: "Premium plan олдсонгүй" },
        { status: 400 }
      );
    }

    const order = await prisma.premiumOrder.create({
      data: {
        userId: user.id,
        months: plan.months,
        amount: plan.amount,
        status: "PENDING",
      },
    });

    const idempotencyKey = `premium-${order.id}-${crypto.randomUUID()}`;

    const paymentIntent = await wireRequest<WirePaymentIntent>(
      "/v1/payment_intents",
      {
        method: "POST",
        idempotencyKey,
        body: {
          amount: plan.amount,
          currency: "MNT",
          automatic_operator: false,
          allowed_operators: ["qpay"],
          metadata: {
            type: "premium",
            orderId: String(order.id),
            userId: String(user.id),
            months: String(plan.months),
          },
        },
      }
    );

    const confirmed = await wireRequest<WirePaymentIntent>(
      `/v1/payment_intents/${paymentIntent.id}/confirm`,
      {
        method: "POST",
        idempotencyKey: `${idempotencyKey}-confirm`,
        body: {
          operator: "qpay",
          return_url: `${siteUrl}/premium/success?orderId=${order.id}`,
        },
      }
    );

    const redirectUrl = getWireRedirectUrl(confirmed.next_action);

    await prisma.premiumOrder.update({
      where: { id: order.id },
      data: {
        wirePaymentIntentId: confirmed.id,
        wireClientSecret: confirmed.client_secret || null,
        wireStatus: confirmed.status,
        wireNextAction: confirmed.next_action
          ? JSON.stringify(confirmed.next_action)
          : null,
      },
    });

    return NextResponse.json({
      message: "Wire төлбөр үүслээ",
      orderId: order.id,
      paymentIntentId: confirmed.id,
      status: confirmed.status,
      redirectUrl,
      nextAction: confirmed.next_action || null,
      clientSecret: confirmed.client_secret || null,
      rawPaymentIntent: confirmed,
    });
  } catch (error) {
    console.error("CREATE WIRE PAYMENT ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Wire төлбөр үүсгэхэд алдаа гарлаа",
      },
      { status: 500 }
    );
  }
}