import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPremiumPlan } from "@/lib/premium";
import {
  createWirePaymentIntent,
  confirmWirePaymentIntent,
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
        userId,
        months: plan.months,
        amount: plan.amount,
        status: "PENDING",
      },
    });

    const transactionRemark = `MANGAZET PREMIUM ORDER-${order.id}`;

    const paymentIntent = await createWirePaymentIntent({
      amount: plan.amount,
      orderId: order.id,
      userId,
      months: plan.months,
      remark: transactionRemark,
    });

    await prisma.premiumOrder.update({
      where: { id: order.id },
      data: {
        invoiceId: paymentIntent.id,
        wirePaymentIntentId: paymentIntent.id,
        wireClientSecret: paymentIntent.client_secret || null,
      },
    });

    const confirmedPayment = await confirmWirePaymentIntent(paymentIntent.id);

    const nextAction = confirmedPayment.next_action || paymentIntent.next_action;

    await prisma.premiumOrder.update({
      where: { id: order.id },
      data: {
        qrText:
          nextAction?.qr_text ||
          nextAction?.qrText ||
          nextAction?.qpay?.qr_text ||
          nextAction?.qpay?.qrText ||
          nextAction?.qr ||
          null,
      },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      months: plan.months,
      amount: plan.amount,
      transactionRemark,

      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || null,
      status: confirmedPayment.status || paymentIntent.status,

      nextAction,
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

      raw: confirmedPayment,
    });
  } catch (error) {
    console.error("Create Wire payment error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Wire төлбөр үүсгэхэд серверийн алдаа гарлаа",
      },
      { status: 500 }
    );
  }
}