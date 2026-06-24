import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const tokenUser = await getCurrentUser();

    if (!tokenUser) {
      return NextResponse.json(
        { message: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const comicId = Number(searchParams.get("comicId"));

    if (comicId && !Number.isNaN(comicId)) {
      const favorite = await prisma.favoriteManga.findUnique({
        where: {
          userId_comicId: {
            userId: tokenUser.id,
            comicId,
          },
        },
      });

      return NextResponse.json({
        isFavorite: Boolean(favorite),
      });
    }

    const favorites = await prisma.favoriteManga.findMany({
      where: {
        userId: tokenUser.id,
      },
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
    });

    return NextResponse.json({
      favorites: favorites.map((item) => item.comic),
    });
  } catch (error) {
    console.error("FAVORITES_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Favorite авахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const tokenUser = await getCurrentUser();

    if (!tokenUser) {
      return NextResponse.json(
        { message: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const comicId = Number(body.comicId);

    if (!comicId || Number.isNaN(comicId)) {
      return NextResponse.json(
        { message: "Comic ID буруу байна" },
        { status: 400 }
      );
    }

    const comic = await prisma.comic.findUnique({
      where: {
        id: comicId,
      },
    });

    if (!comic) {
      return NextResponse.json(
        { message: "Manga олдсонгүй" },
        { status: 404 }
      );
    }

    const exists = await prisma.favoriteManga.findUnique({
      where: {
        userId_comicId: {
          userId: tokenUser.id,
          comicId,
        },
      },
    });

    if (exists) {
      await prisma.favoriteManga.delete({
        where: {
          userId_comicId: {
            userId: tokenUser.id,
            comicId,
          },
        },
      });

      return NextResponse.json({
        message: "Favorite-оос хаслаа",
        isFavorite: false,
      });
    }

    await prisma.favoriteManga.create({
      data: {
        userId: tokenUser.id,
        comicId,
      },
    });

    return NextResponse.json({
      message: "Favorite-д нэмлээ",
      isFavorite: true,
    });
  } catch (error) {
    console.error("FAVORITES_POST_ERROR:", error);

    return NextResponse.json(
      { message: "Favorite өөрчлөхөд алдаа гарлаа" },
      { status: 500 }
    );
  }
}