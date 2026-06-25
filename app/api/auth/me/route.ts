import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isPremiumActive } from "@/lib/premium";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          user: null,
          authenticated: false,
        },
        { status: 401 }
      );
    }

    const premiumActive = isPremiumActive(
      user.isPremium,
      user.premiumExpiresAt
    );

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: premiumActive,
        premiumExpiresAt: user.premiumExpiresAt,
        profileImage: user.profileImage,
        avatarPreset: user.avatarPreset,
        xp: user.xp,
        level: user.level,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);

    return NextResponse.json(
      {
        message: "Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа",
      },
      { status: 500 }
    );
  }
}