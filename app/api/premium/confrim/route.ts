import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const tokenUser = await getCurrentUser();

    if (!tokenUser) {
      return NextResponse.json(
        { message: "Login шаардлагатай" },
        { status: 401 }
      );
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID байхгүй байна" },
        { status: 400 }
      );
    }

    const order = await prisma.premiumOrder.findUnique({
      where: {
        id: Number(orderId),
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order олдсонгүй" },
        { status: 404 }
      );
    }

    if (order.userId !== tokenUser.id) {
      return NextResponse.json(
        { message: "Энэ order таны order биш байна" },
        { status: 403 }
      );
    }

    if (order.status === "PAID") {
      return NextResponse.json({
        message: "Энэ order аль хэдийн төлөгдсөн байна",
      });
    }

    await prisma.$transaction([
      prisma.premiumOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      }),

      prisma.user.update({
        where: {
          id: tokenUser.id,
        },
        data: {
          isPremium: true,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Төлбөр амжилттай. Premium эрх идэвхжлээ.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Premium confirm хийхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}