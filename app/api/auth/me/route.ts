import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tokenUser = await getCurrentUser();

    if (!tokenUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: tokenUser.id,
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

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const premiumExpired =
      user.isPremium &&
      user.premiumExpiresAt !== null &&
      new Date(user.premiumExpiresAt).getTime() <= Date.now();

    if (premiumExpired) {
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
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

      return NextResponse.json({ user: updatedUser });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { user: null, message: "Хэрэглэгч шалгахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}