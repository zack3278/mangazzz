import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPremiumPlan, isValidPremiumMonths } from "@/lib/premium";
import { wireRequest, WirePaymentIntent } from "@/lib/wire";

function isImageUrl(url: string) {
  return /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(url);
}

function extractWirePaymentData(value: any) {
  let paymentUrl: string | null = null;
  let qrImageUrl: string | null = null;
  let qrText: string | null = null;

  const appLinks: { name: string; url: string; logo?: string }[] = [];

  function walk(obj: any) {
    if (!obj) return;

    if (typeof obj === "string") {
      if (
        obj.startsWith("http") &&
        !isImageUrl(obj) &&
        !obj.includes("launcher-icon") &&
        !obj.includes("icon")
      ) {
        if (
          obj.includes("pay.wire.mn") ||
          obj.includes("checkout") ||
          obj.includes("payment") ||
          obj.includes("invoice") ||
          obj.includes("qpay.mn")
        ) {
          paymentUrl = paymentUrl || obj;
        }
      }

      if (
        obj.startsWith("http") &&
        isImageUrl(obj) &&
        !obj.includes("launcher-icon") &&
        !obj.includes("icon")
      ) {
        qrImageUrl = qrImageUrl || obj;
      }

      if (
        obj.startsWith("qpay://") ||
        obj.startsWith("khanbank://") ||
        obj.startsWith("statebank://") ||
        obj.startsWith("tdbbank://") ||
        obj.startsWith("socialpay://")
      ) {
        paymentUrl = paymentUrl || obj;
      }

      return;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) walk(item);
      return;
    }

    if (typeof obj === "object") {
      const possibleQrText =
        obj.qr_text ||
        obj.qrText ||
        obj.qr ||
        obj.qr_data ||
        obj.qrData ||
        obj.qpay_qr_text ||
        obj.qpayQrText;

      if (typeof possibleQrText === "string") {
        qrText = qrText || possibleQrText;
      }

      const possibleQrImage =
        obj.qr_image ||
        obj.qrImage ||
        obj.qr_image_url ||
        obj.qrImageUrl ||
        obj.qpay_qr_image ||
        obj.qpayQrImage ||
        obj.image_url ||
        obj.imageUrl;

      if (
        typeof possibleQrImage === "string" &&
        possibleQrImage.startsWith("http") &&
        !possibleQrImage.includes("launcher-icon") &&
        !possibleQrImage.includes("icon")
      ) {
        qrImageUrl = qrImageUrl || possibleQrImage;
      }

      const possiblePaymentUrl =
        obj.payment_url ||
        obj.paymentUrl ||
        obj.checkout_url ||
        obj.checkoutUrl ||
        obj.invoice_url ||
        obj.invoiceUrl ||
        obj.redirect_url ||
        obj.redirectUrl ||
        obj.deeplink ||
        obj.deep_link ||
        obj.link;

      if (
        typeof possiblePaymentUrl === "string" &&
        !possiblePaymentUrl.includes("launcher-icon") &&
        !possiblePaymentUrl.includes("icon")
      ) {
        paymentUrl = paymentUrl || possiblePaymentUrl;
      }

      const appName =
        obj.name ||
        obj.app_name ||
        obj.appName ||
        obj.bank_name ||
        obj.bankName ||
        obj.description;

      const appUrl =
        obj.url ||
        obj.link ||
        obj.deeplink ||
        obj.deep_link ||
        obj.payment_url ||
        obj.paymentUrl;

      const logo =
        obj.logo ||
        obj.logo_url ||
        obj.logoUrl ||
        obj.icon ||
        obj.icon_url ||
        obj.iconUrl;

      if (
        typeof appName === "string" &&
        typeof appUrl === "string" &&
        (appUrl.startsWith("http") || appUrl.includes("://")) &&
        !appUrl.includes("launcher-icon")
      ) {
        appLinks.push({
          name: appName,
          url: appUrl,
          logo: typeof logo === "string" ? logo : undefined,
        });
      }

      for (const key of Object.keys(obj)) {
        walk(obj[key]);
      }
    }
  }

  walk(value);

  return {
    paymentUrl,
    qrImageUrl,
    qrText,
    appLinks,
  };
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

    const paymentData = extractWirePaymentData(confirmed);

    await prisma.premiumOrder.update({
      where: { id: order.id },
      data: {
        wirePaymentIntentId: confirmed.id,
        wireClientSecret: confirmed.client_secret || null,
        wireStatus: confirmed.status,
        wireNextAction: confirmed.next_action
          ? JSON.stringify(confirmed.next_action)
          : null,
        qrText: paymentData.qrText || null,
      },
    });

    return NextResponse.json({
      message: "Wire төлбөр үүслээ",
      orderId: order.id,
      paymentIntentId: confirmed.id,
      status: confirmed.status,
      paymentUrl: paymentData.paymentUrl,
      qrImageUrl: paymentData.qrImageUrl,
      qrText: paymentData.qrText,
      appLinks: paymentData.appLinks,
      nextAction: confirmed.next_action || null,
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