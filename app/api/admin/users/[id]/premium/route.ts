import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { addMonths, getPremiumPlan, isValidPremiumMonths } from "@/lib/premium";

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
    const userId = Number(id);

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        { message: "User ID буруу байна" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const isPremium = Boolean(body.isPremium);
    const months = Number(body.months || 1);

    if (!isPremium) {
      const user = await prisma.user.update({
        where: { id: userId },
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

    if (!isValidPremiumMonths(months)) {
      return NextResponse.json(
        { message: "Premium хугацаа буруу байна" },
        { status: 400 }
      );
    }

    const plan = getPremiumPlan(months);

    if (!plan) {
      return NextResponse.json(
        { message: "Premium plan олдсонгүй" },
        { status: 400 }
      );
    }

    const now = new Date();

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        premiumExpiresAt: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: "User олдсонгүй" },
        { status: 404 }
      );
    }

    const startDate =
      currentUser.premiumExpiresAt &&
      new Date(currentUser.premiumExpiresAt).getTime() > now.getTime()
        ? new Date(currentUser.premiumExpiresAt)
        : now;

    const premiumExpiresAt = addMonths(startDate, months);

    const user = await prisma.user.update({
      where: { id: userId },
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
      message: `${plan.name} premium эрх амжилттай олголоо`,
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