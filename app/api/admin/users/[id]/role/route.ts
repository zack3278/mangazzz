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
        { message: "Зөвхөн ADMIN role өөрчилнө" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { role } = await req.json();

    if (!["USER", "EDITOR", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { message: "Role буруу байна" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Role амжилттай өөрчлөгдлөө",
      user,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Role өөрчлөхөд алдаа гарлаа" },
      { status: 500 }
    );
  }
}