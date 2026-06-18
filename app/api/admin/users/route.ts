import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function isExpired(date: Date | null) {
  if (!date) return false;
  return date.getTime() <= Date.now();
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Зөвхөн ADMIN хэрэглэгч харна" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isPremium: true,
        premiumExpiresAt: true,
        createdAt: true,
      },
    });

    const expiredPremiumUserIds = users
      .filter((user) => user.isPremium && isExpired(user.premiumExpiresAt))
      .map((user) => user.id);

    if (expiredPremiumUserIds.length > 0) {
      await prisma.user.updateMany({
        where: {
          id: {
            in: expiredPremiumUserIds,
          },
        },
        data: {
          isPremium: false,
          premiumExpiresAt: null,
        },
      });
    }

    const fixedUsers = users.map((user) => {
      if (user.isPremium && isExpired(user.premiumExpiresAt)) {
        return {
          ...user,
          isPremium: false,
          premiumExpiresAt: null,
        };
      }

      return user;
    });

    return NextResponse.json(fixedUsers);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "User жагсаалт авахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}