import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tokenUser = await getCurrentUser();

    if (!tokenUser) {
      return NextResponse.json(
        { user: null, message: "Unauthorized" },
        { status: 401 }
      );
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
        profileImage: true,
        avatarPreset: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { user: null, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("AUTH ME ERROR:", error);

    return NextResponse.json(
      { user: null, message: "Server error" },
      { status: 500 }
    );
  }
}