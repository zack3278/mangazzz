import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { activatePremiumByOrderId } from "@/lib/premium";

function verifyWireSignature(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.WIRE_WEBHOOK_SECRET;

  if (!secret) {
    console.warn("WIRE_WEBHOOK_SECRET тохируулаагүй байна");
    return false;
  }

  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split(",");

  const timestamp = parts
    .find((part) => part.trim().startsWith("t="))
    ?.trim()
    .replace("t=", "");

  const signature = parts
    .find((part) => part.trim().startsWith("v1="))
    ?.trim()
    .replace("v1=", "");

  if (!timestamp || !signature) {
    return false;
  }

  const payload = `${timestamp}.${rawBody}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

function isPaidStatus(status?: string | null) {
  if (!status) return false;

  return [
    "paid",
    "succeeded",
    "success",
    "completed",
    "payment_succeeded",
  ].includes(status.toLowerCase());
}

function getPaymentIntentId(event: any) {
  return (
    event?.data?.id ||
    event?.data?.object?.id ||
    event?.data?.payment_intent ||
    event?.data?.paymentIntent ||
    event?.payment_intent ||
    event?.paymentIntent ||
    null
  );
}

function getPaymentStatus(event: any) {
  return (
    event?.data?.status ||
    event?.data?.object?.status ||
    event?.status ||
    null
  );
}

function getOrderIdFromMetadata(event: any) {
  const metadata =
    event?.data?.metadata ||
    event?.data?.object?.metadata ||
    event?.metadata ||
    null;

  const orderId = metadata?.orderId || metadata?.order_id;

  if (!orderId) return null;

  const parsed = Number(orderId);

  return Number.isInteger(parsed) ? parsed : null;
}

function isVerificationEvent(event: any) {
  const type = String(event?.type || "").toLowerCase();

  return (
    type.includes("ping") ||
    type.includes("verify") ||
    type.includes("verification") ||
    type.includes("webhook_endpoint")
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Wire webhook endpoint is working",
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    let event: any = null;

    try {
      event = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      event = {};
    }

    console.log("WIRE WEBHOOK RAW:", rawBody);
    console.log("WIRE WEBHOOK EVENT:", JSON.stringify(event, null, 2));

    /**
     * Wire dashboard endpoint баталгаажуулах үед ping/verification event ирвэл
     * заавал 2xx буцаана. Ийм үед premium идэвхжүүлэхгүй.
     */
    if (isVerificationEvent(event)) {
      return NextResponse.json({
        received: true,
        verified: true,
      });
    }

    const signature = req.headers.get("WirePayment-Signature");

    /**
     * Бодит payment event дээр signature шалгана.
     */
    const isValid = verifyWireSignature(rawBody, signature);

    if (!isValid) {
      console.error("Invalid Wire webhook signature");

      return NextResponse.json(
        {
          received: false,
          message: "Invalid Wire signature",
        },
        { status: 401 }
      );
    }

    const paymentIntentId = getPaymentIntentId(event);
    const status = getPaymentStatus(event);
    const orderIdFromMetadata = getOrderIdFromMetadata(event);

    let order = null;

    if (orderIdFromMetadata) {
      order = await prisma.premiumOrder.findUnique({
        where: {
          id: orderIdFromMetadata,
        },
      });
    }

    if (!order && paymentIntentId) {
      order = await prisma.premiumOrder.findFirst({
        where: {
          wirePaymentIntentId: paymentIntentId,
        },
      });
    }

    if (!order) {
      return NextResponse.json({
        received: true,
        premiumActivated: false,
        message: "Order not found",
      });
    }

    await prisma.premiumOrder.update({
      where: {
        id: order.id,
      },
      data: {
        wireStatus: status || event.type || "webhook_received",
      },
    });

    if (
      event.type === "payment_intent.succeeded" ||
      event.type === "payment_intent.paid" ||
      event.type === "charge.succeeded" ||
      event.type === "charge.paid" ||
      isPaidStatus(status)
    ) {
      await activatePremiumByOrderId(order.id);

      return NextResponse.json({
        received: true,
        premiumActivated: true,
      });
    }

    return NextResponse.json({
      received: true,
      premiumActivated: false,
      status,
    });
  } catch (error) {
    console.error("WIRE WEBHOOK ERROR:", error);

    return NextResponse.json(
      {
        received: false,
        message: "Wire webhook боловсруулахад алдаа гарлаа",
      },
      { status: 500 }
    );
  }
}