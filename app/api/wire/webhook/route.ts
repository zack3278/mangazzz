import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { activatePremiumByOrderId } from "@/lib/premium";

function verifyWireSignature(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.WIRE_WEBHOOK_SECRET;

  if (!secret) {
    console.warn("WIRE_WEBHOOK_SECRET env тохируулаагүй байна");
    return false;
  }

  if (!signatureHeader) return false;

  const parts = signatureHeader.split(",");

  const timestamp = parts
    .find((part) => part.trim().startsWith("t="))
    ?.trim()
    .replace("t=", "");

  const signature = parts
    .find((part) => part.trim().startsWith("v1="))
    ?.trim()
    .replace("v1=", "");

  if (!timestamp || !signature) return false;

  const payload = `${timestamp}.${rawBody}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
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

function isPaidEvent(event: any) {
  const type = String(event?.type || "").toLowerCase();

  const status = String(
    event?.data?.status ||
      event?.data?.object?.status ||
      event?.status ||
      ""
  ).toLowerCase();

  return (
    type.includes("payment_intent.succeeded") ||
    type.includes("payment_intent.paid") ||
    type.includes("payment_intent.payment_succeeded") ||
    type.includes("charge.succeeded") ||
    type.includes("charge.paid") ||
    status === "paid" ||
    status === "succeeded" ||
    status === "success" ||
    status === "completed"
  );
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

function getStatus(event: any) {
  return (
    event?.data?.status ||
    event?.data?.object?.status ||
    event?.status ||
    event?.type ||
    "webhook_received"
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

    let event: any = {};

    try {
      event = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      event = {};
    }

    console.log("WIRE WEBHOOK EVENT:", JSON.stringify(event, null, 2));

    /**
     * Wire dashboard баталгаажуулах event дээр шууд 200 буцаана.
     */
    if (isVerificationEvent(event)) {
      return NextResponse.json({
        received: true,
        verified: true,
      });
    }

    /**
     * Бодит төлбөрийн event дээр signature шалгана.
     */
    const signature = req.headers.get("WirePayment-Signature");
    const isValid = verifyWireSignature(rawBody, signature);

    if (!isValid) {
      console.error("Invalid Wire signature");

      return NextResponse.json(
        {
          received: false,
          message: "Invalid Wire signature",
        },
        { status: 401 }
      );
    }

    const paymentIntentId = getPaymentIntentId(event);
    const orderIdFromMetadata = getOrderIdFromMetadata(event);
    const status = getStatus(event);

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
      console.log("WIRE WEBHOOK: order not found", {
        paymentIntentId,
        orderIdFromMetadata,
      });

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
        wireStatus: String(status),
      },
    });

    if (isPaidEvent(event)) {
      await activatePremiumByOrderId(order.id);

      return NextResponse.json({
        received: true,
        premiumActivated: true,
        orderId: order.id,
      });
    }

    return NextResponse.json({
      received: true,
      premiumActivated: false,
      orderId: order.id,
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