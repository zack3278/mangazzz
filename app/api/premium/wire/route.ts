import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPremiumPlan } from "@/lib/premium";
import {
  createWirePaymentIntent,
  confirmWirePaymentIntent,
} from "@/lib/wire";

type AppLink = {
  name: string;
  description?: string;
  logo?: string;
  link?: string;
};

function getNextActionValue(nextAction: any) {
  return {
    qrText:
      nextAction?.qr_text ||
      nextAction?.qrText ||
      nextAction?.qpay?.qr_text ||
      nextAction?.qpay?.qrText ||
      nextAction?.qr ||
      null,

    qrImage:
      nextAction?.qr_image ||
      nextAction?.qrImage ||
      nextAction?.qpay?.qr_image ||
      nextAction?.qpay?.qrImage ||
      null,

    deeplink:
      nextAction?.deeplink ||
      nextAction?.deepLink ||
      nextAction?.payment_url ||
      nextAction?.paymentUrl ||
      null,

    apps:
      nextAction?.apps ||
      nextAction?.app_links ||
      nextAction?.qpay?.apps ||
      [],
  };
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Эхлээд нэвтэрнэ үү" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const months = Number(body.months);

    const plan = getPremiumPlan(months);

    if (!plan) {
      return NextResponse.json(
        { message: "Premium багц буруу байна" },
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

    const transactionRemark = `MANGAZET PREMIUM ORDER-${order.id}`;

    const paymentIntent = await createWirePaymentIntent({
      amount: plan.amount,
      orderId: order.id,
      userId: user.id,
      months: plan.months,
      remark: transactionRemark,
    });

    const confirmed = await confirmWirePaymentIntent(paymentIntent.id);
    const nextAction = confirmed.next_action || paymentIntent.next_action;
    const actionValues = getNextActionValue(nextAction);

    await prisma.premiumOrder.update({
      where: {
        id: order.id,
      },
      data: {
        invoiceId: paymentIntent.id,
        wirePaymentIntentId: paymentIntent.id,
        wireClientSecret: paymentIntent.client_secret || null,
        wireStatus: confirmed.status || paymentIntent.status,
        wireNextAction: nextAction ? JSON.stringify(nextAction) : null,
        qrText: actionValues.qrText,
      },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      amount: plan.amount,
      months: plan.months,
      transactionRemark,

      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || null,
      status: confirmed.status || paymentIntent.status,

      qrText: actionValues.qrText,
      qrImage: actionValues.qrImage,
      deeplink: actionValues.deeplink,
      apps: actionValues.apps as AppLink[],

      nextAction,
      raw: confirmed,
    });
  } catch (error) {
    console.error("POST /api/premium/wire error:", error);

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