import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const premiumPlans: Record<number, string> = {
  1: "1 сар",
  3: "3 сар",
  6: "6 сар",
  12: "1 жил",
};

function addMonths(date: Date, months: number) {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

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
    const userId = Number(id);

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        { message: "User ID буруу байна" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const action = String(body.action || "");

    if (action === "cancel") {
      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isPremium: false,
          premiumExpiresAt: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isPremium: true,
          premiumExpiresAt: true,
        },
      });

      return NextResponse.json({
        message: "Premium эрхийг цуцаллаа",
        user,
      });
    }

    const months = Number(body.months);

    if (![1, 3, 6, 12].includes(months)) {
      return NextResponse.json(
        { message: "Premium хугацаа буруу байна" },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        isPremium: true,
        premiumExpiresAt: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: "User олдсонгүй" },
        { status: 404 }
      );
    }

    const now = new Date();

    const currentExpiresAt = currentUser.premiumExpiresAt
      ? new Date(currentUser.premiumExpiresAt)
      : null;

    const startDate =
      currentUser.isPremium &&
      currentExpiresAt !== null &&
      currentExpiresAt.getTime() > now.getTime()
        ? currentExpiresAt
        : now;

    const premiumExpiresAt = addMonths(startDate, months);

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isPremium: true,
        premiumExpiresAt,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isPremium: true,
        premiumExpiresAt: true,
      },
    });

    return NextResponse.json({
      message: `${premiumPlans[months]} premium эрх амжилттай олголоо`,
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