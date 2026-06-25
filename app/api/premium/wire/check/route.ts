import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPremiumExpireDate } from "@/lib/premium";
import {
  isWirePaymentPaid,
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

    const body = await req.json();

    const orderId = Number(body.orderId);
    const paymentIntentId = String(body.paymentIntentId || "");

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

    if (!isWirePaymentPaid(paymentIntent.status)) {
      return NextResponse.json({
        ok: true,
        paid: false,
        status: paymentIntent.status,
        message: "Төлбөр хараахан төлөгдөөгүй байна",
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
      status: paymentIntent.status,
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