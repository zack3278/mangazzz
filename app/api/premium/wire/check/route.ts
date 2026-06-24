import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { wireRequest, WirePaymentIntent } from "@/lib/wire";
import { activatePremiumByOrderId } from "@/lib/premium";

function isPaidStatus(status?: string | null) {
  if (!status) return false;

  return ["paid", "succeeded", "success", "completed"].includes(
    status.toLowerCase()
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

    const body = await req.json();
    const orderId = Number(body.orderId);

    if (!Number.isInteger(orderId)) {
      return NextResponse.json(
        { message: "Order ID буруу байна" },
        { status: 400 }
      );
    }

    const order = await prisma.premiumOrder.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
    });

    if (!order || !order.wirePaymentIntentId) {
      return NextResponse.json(
        { message: "Төлбөрийн хүсэлт олдсонгүй" },
        { status: 404 }
      );
    }

    const paymentIntent = await wireRequest<WirePaymentIntent>(
      `/v1/payment_intents/${order.wirePaymentIntentId}`
    );

    await prisma.premiumOrder.update({
      where: { id: order.id },
      data: {
        wireStatus: paymentIntent.status,
      },
    });

    if (isPaidStatus(paymentIntent.status)) {
      await activatePremiumByOrderId(order.id);

      return NextResponse.json({
        paid: true,
        status: paymentIntent.status,
        message: "Төлбөр амжилттай. Premium эрх автоматаар идэвхжлээ.",
      });
    }

    return NextResponse.json({
      paid: false,
      status: paymentIntent.status,
      message: `Төлбөр хараахан баталгаажаагүй байна. Status: ${paymentIntent.status}`,
    });
  } catch (error) {
    console.error("CHECK WIRE PAYMENT ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Төлбөр шалгахад алдаа гарлаа",
      },
      { status: 500 }
    );
  }
}