import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPremiumExpireDate } from "@/lib/premium";
import {
  isWirePaymentPaid,
  isWireChargePaid,
  listWireChargesByPaymentIntent,
  retrieveWirePaymentIntent,
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

    const orderId = Number(body.orderId);
    const paymentIntentId = String(body.paymentIntentId || "").trim();

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { message: "Төлбөрийн мэдээлэл дутуу байна" },
        { status: 400 }
      );
    }

    const order = await prisma.premiumOrder.findFirst({
      where: {
        id: orderId,
        userId,
        wirePaymentIntentId: paymentIntentId,
      },
      include: {
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Төлбөрийн захиалга олдсонгүй" },
        { status: 404 }
      );
    }

    if (order.status === "PAID") {
      return NextResponse.json({
        ok: true,
        paid: true,
        message: "Premium эрх аль хэдийн идэвхжсэн байна",
        premiumExpiresAt: order.user.premiumExpiresAt,
      });
    }

    const paymentIntent = await retrieveWirePaymentIntent(paymentIntentId);

    let paid = isWirePaymentPaid(paymentIntent.status);
    let succeededCharge: { id?: string; status?: string } | null = null;

    try {
      const charges = await listWireChargesByPaymentIntent(paymentIntentId);

      succeededCharge =
        charges.data.find((charge) => isWireChargePaid(charge.status)) || null;

      if (succeededCharge) {
        paid = true;
      }
    } catch (chargeError) {
      console.error("Wire charge check skipped:", chargeError);
    }

    await prisma.premiumOrder.update({
      where: { id: order.id },
      data: {
        wireStatus: paymentIntent.status,
        wireNextAction: paymentIntent.next_action
          ? JSON.stringify(paymentIntent.next_action)
          : null,
      },
    });

    if (!paid) {
      return NextResponse.json({
        ok: true,
        paid: false,
        status: paymentIntent.status,
        message:
          paymentIntent.status === "processing"
            ? "Төлбөр боловсруулагдаж байна. Түр хүлээгээд дахин шалгана уу."
            : paymentIntent.status === "canceled"
              ? "Төлбөр цуцлагдсан байна."
              : "Төлбөр хараахан төлөгдөөгүй байна.",
      });
    }

    const premiumExpiresAt = getPremiumExpireDate(
      order.user.premiumExpiresAt,
      order.months
    );

    await prisma.$transaction([
      prisma.premiumOrder.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          wireStatus: "succeeded",
          paidAt: new Date(),
        },
      }),

      prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumExpiresAt,
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      paid: true,
      status: "succeeded",
      chargeId: succeededCharge?.id || null,
      message: "Төлбөр амжилттай. Premium эрх идэвхжлээ.",
      premiumExpiresAt,
    });
  } catch (error) {
    console.error("Check Wire payment error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Төлбөр шалгахад серверийн алдаа гарлаа",
      },
      { status: 500 }
    );
  }
}