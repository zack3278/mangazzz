import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { levelFromXp, nextLevelXp, rewardByLevel } from "@/lib/gamification";

export async function GET() {
  try {
    const tokenUser = await getCurrentUser();

    if (!tokenUser) {
      return NextResponse.json(
        { message: "Нэвтрээгүй байна" },
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
        isPremium: true,
        premiumExpiresAt: true,
        profileImage: true,
        avatarPreset: true,
        xp: true,
        level: true,
        favoriteMangas: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            comic: {
              include: {
                chapters: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Хэрэглэгч олдсонгүй" },
        { status: 404 }
      );
    }

    const calculatedLevel = levelFromXp(user.xp);
    const nextXp = nextLevelXp(calculatedLevel);
    const currentLevelStart = nextLevelXp(calculatedLevel - 1);
    const progressTotal = nextXp - currentLevelStart;
    const progressNow = user.xp - currentLevelStart;
    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round((progressNow / progressTotal) * 100))
    );

    return NextResponse.json({
      user: {
        ...user,
        level: calculatedLevel,
        nextLevelXp: nextXp,
        currentLevelStartXp: currentLevelStart,
        progressPercent,
        nextReward: rewardByLevel(calculatedLevel + 1),
        favoriteMangas: user.favoriteMangas.map((item) => item.comic),
      },
    });
  } catch (error) {
    console.error("PROFILE_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Profile авахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const tokenUser = await getCurrentUser();

    if (!tokenUser) {
      return NextResponse.json(
        { message: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const profileImage =
      typeof body.profileImage === "string" ? body.profileImage.trim() : null;
    const avatarPreset =
      typeof body.avatarPreset === "string" ? body.avatarPreset.trim() : null;

    const allowedPresets = ["boy", "girl"];

    const data: {
      profileImage?: string | null;
      avatarPreset?: string;
    } = {};

    if (profileImage !== null) {
      data.profileImage = profileImage || null;
    }

    if (avatarPreset && allowedPresets.includes(avatarPreset)) {
      data.avatarPreset = avatarPreset;
      data.profileImage = null;
    }

    const user = await prisma.user.update({
      where: {
        id: tokenUser.id,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        isPremium: true,
        premiumExpiresAt: true,
        profileImage: true,
        avatarPreset: true,
        xp: true,
        level: true,
      },
    });

    return NextResponse.json({
      message: "Profile шинэчлэгдлээ",
      user,
    });
  } catch (error) {
    console.error("PROFILE_PATCH_ERROR:", error);

    return NextResponse.json(
      { message: "Profile шинэчлэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}