import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isPremiumActive } from "@/lib/premium";

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

    const fixedUsers = await Promise.all(
      users.map(async (user) => {
        const active = isPremiumActive(user);

        if (user.isPremium && !active) {
          const updated = await prisma.user.update({
            where: { id: user.id },
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
              createdAt: true,
            },
          });

          return updated;
        }

        return {
          ...user,
          isPremium: active,
        };
      })
    );

    return NextResponse.json(fixedUsers);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "User жагсаалт авахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}