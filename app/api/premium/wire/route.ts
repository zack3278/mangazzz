import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createWirePaymentIntent,
  confirmWirePaymentIntent,
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

  if (!raw) {
    return undefined;
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
    const remark = `Mangazet Premium ${plan.months} сар`;

    const order = await prisma.premiumOrder.create({
      data: {
        userId: user.id,
        months: plan.months,
        amount: plan.amount,
        status: "PENDING",
        invoiceId,
      },
    });

    const createData = await createWirePaymentIntent({
      amount: plan.amount,
      orderId: order.id,
      userId: user.id,
      months: plan.months,
      remark,
      automatic_operator: true,
      allowed_operators: getAllowedOperators(),
      metadata: {
        invoiceId,
        site: "Mangazet",
        email: user.email,
        name: user.name,
        returnUrl: `${siteUrl}/premium/success`,
      },
    });

    const paymentIntentId =
      createData?.id || (createData as any)?.data?.id || null;

    if (!paymentIntentId) {
      return NextResponse.json(
        {
          message: "Wire.mn PaymentIntent ID олдсонгүй",
          createData,
        },
        { status: 500 }
      );
    }

    const confirmData = await confirmWirePaymentIntent(paymentIntentId);

    const paymentUrl =
      getWirePaymentUrl(confirmData) || getWirePaymentUrl(createData);

    const qrText = getWireQrText(confirmData) || getWireQrText(createData);

    await prisma.premiumOrder.update({
      where: { id: order.id },
      data: {
        qrText: qrText || null,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Wire.mn payment үүслээ",
      orderId: order.id,
      invoiceId,
      paymentIntentId,
      paymentUrl,
      checkoutUrl: paymentUrl,
      qrText,
      amount: plan.amount,
      months: plan.months,
      status: confirmData?.status || createData?.status || null,
      createData,
      confirmData,
    });
  } catch (error: any) {
    console.error("Create Wire payment error:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Wire.mn төлбөр үүсгэхэд серверийн алдаа гарлаа",
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
          WIRE_API_KEY: !process.env.WIRE_API_KEY && !process.env.WIRE_SECRET_KEY,
        },
      },
      { status: error?.status || 500 }
    );
  }
}