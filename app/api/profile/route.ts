import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

        readingHistories: {
          take: 8,
          orderBy: {
            updatedAt: "desc",
          },
          include: {
            comic: true,
            chapter: true,
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

    return NextResponse.json({
      user: {
        ...user,
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

    const name =
      typeof body.name === "string" ? body.name.trim() : undefined;

    const profileImage =
      typeof body.profileImage === "string"
        ? body.profileImage.trim()
        : undefined;

    const data: {
      name?: string;
      profileImage?: string | null;
    } = {};

    if (name !== undefined) {
      if (name.length < 2) {
        return NextResponse.json(
          { message: "Нэр хамгийн багадаа 2 тэмдэгт байна" },
          { status: 400 }
        );
      }

      data.name = name;
    }

    if (profileImage !== undefined) {
      data.profileImage = profileImage || null;
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