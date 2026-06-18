import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, { params }: Props) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Зөвхөн ADMIN premium эрх өөрчилнө" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { isPremium } = await req.json();

    if (typeof isPremium !== "boolean") {
      return NextResponse.json(
        { message: "Premium утга буруу байна" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        isPremium,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isPremium: true,
      },
    });

    return NextResponse.json({
      message: isPremium
        ? "Premium эрх амжилттай олголоо"
        : "Premium эрхийг цуцаллаа",
      user,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Premium эрх өөрчлөхөд алдаа гарлаа" },
      { status: 500 }
    );
  }
}