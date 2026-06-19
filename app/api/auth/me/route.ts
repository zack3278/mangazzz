import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPremiumActive } from "@/lib/premium";

export async function GET() {
  const tokenUser = await getCurrentUser();

  if (!tokenUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenUser.id },
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

  const active = isPremiumActive(user);

  if (user.isPremium && !active) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isPremium: false,
        premiumExpiresAt: null,
      },
    });
  }

  return NextResponse.json({
    user: {
      ...user,
      isPremium: active,
      premiumExpiresAt: active ? user.premiumExpiresAt : null,
    },
  });
}