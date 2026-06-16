import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const tokenUser = await getCurrentUser();

    if (!tokenUser) {
      return NextResponse.json(
        { message: "Premium авахын тулд login хийнэ үү" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: tokenUser.id,
      },
      select: {
        id: true,
        email: true,
        isPremium: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Хэрэглэгч олдсонгүй" },
        { status: 404 }
      );
    }

    if (user.isPremium) {
      return NextResponse.json(
        { message: "Та аль хэдийн premium эрхтэй байна" },
        { status: 400 }
      );
    }

    const amount = 9900;
    const invoiceId = `UNSHY-${user.id}-${Date.now()}`;

    const qrText = `UNSHY PREMIUM\nInvoice: ${invoiceId}\nAmount: ${amount} MNT\nUser: ${user.email}`;

    const order = await prisma.premiumOrder.create({
      data: {
        userId: user.id,
        amount,
        invoiceId,
        qrText,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Premium төлбөрийн нэхэмжлэл үүслээ",
      order: {
        id: order.id,
        amount: order.amount,
        status: order.status,
        invoiceId: order.invoiceId,
        qrText: order.qrText,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Premium order үүсгэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}