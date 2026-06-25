import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const comicId =
      typeof body.comicId === "string" ? body.comicId.trim() : "";

    const chapterId =
      typeof body.chapterId === "string" ? body.chapterId.trim() : "";

    if (!comicId || !chapterId) {
      return NextResponse.json(
        { message: "comicId болон chapterId хэрэгтэй" },
        { status: 400 }
      );
    }

    const history = await prisma.readingHistory.upsert({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId,
        },
      },
      update: {
        comicId,
      },
      create: {
        userId: user.id,
        comicId,
        chapterId,
      },
    });

    return NextResponse.json({
      message: "Уншсан түүх хадгалагдлаа",
      history,
    });
  } catch (error) {
    console.error("READ_HISTORY_ERROR:", error);

    return NextResponse.json(
      { message: "Уншсан түүх хадгалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}