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

  if (!signatureHeader) return false;

  const parts = signatureHeader.split(",");

  const timestamp = parts
    .find((part) => part.startsWith("t="))
    ?.replace("t=", "");

  const signature = parts
    .find((part) => part.startsWith("v1="))
    ?.replace("v1=", "");

  if (!timestamp || !signature) return false;

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

function getPaymentIntentFromEvent(event: any) {
  if (event?.data?.object === "payment_intent") {
    return event.data;
  }

  if (event?.data?.id) {
    return event.data;
  }

  if (event?.data?.payment_intent) {
    return event.data.payment_intent;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("WirePayment-Signature");

    const isValid = verifyWireSignature(rawBody, signature);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid Wire signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);

    if (event.type === "webhook_endpoint.ping") {
      return NextResponse.json({ received: true });
    }

    const paymentIntent = getPaymentIntentFromEvent(event);

    if (!paymentIntent?.id) {
      return NextResponse.json({ received: true });
    }

    const order = await prisma.premiumOrder.findFirst({
      where: {
        wirePaymentIntentId: paymentIntent.id,
      },
    });

    if (!order) {
      return NextResponse.json({ received: true });
    }

    await prisma.premiumOrder.update({
      where: { id: order.id },
      data: {
        wireStatus: paymentIntent.status || event.type,
      },
    });

    if (
      event.type === "payment_intent.succeeded" ||
      paymentIntent.status === "succeeded" ||
      paymentIntent.status === "paid"
    ) {
      await activatePremiumByOrderId(order.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Wire webhook боловсруулахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}