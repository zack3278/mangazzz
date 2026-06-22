import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const chapters = await prisma.chapter.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("GET_CHAPTERS_ERROR:", error);

    return NextResponse.json(
      { message: "Chapter жагсаалт авахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const comicId = body.comicId || body.mangaId;
    const title = body.title;
    const number = Number(body.number);
    const content = body.content || "";

    if (!comicId) {
      return NextResponse.json(
        { message: "Manga сонгогдоогүй байна" },
        { status: 400 }
      );
    }

    if (!title || !String(title).trim()) {
      return NextResponse.json(
        { message: "Chapter нэр дутуу байна" },
        { status: 400 }
      );
    }

    if (!number || Number.isNaN(number) || number <= 0) {
      return NextResponse.json(
        { message: "Chapter дугаар дутуу эсвэл буруу байна" },
        { status: 400 }
      );
    }

    if (!content || !String(content).trim()) {
      return NextResponse.json(
        { message: "Chapter зураг дутуу байна" },
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

    const chapter = await prisma.chapter.create({
      data: {
        title: String(title).trim(),
        number,
        content: String(content).trim(),
        comicId,
      },
    });

    return NextResponse.json({
      message: "Chapter амжилттай нэмэгдлээ",
      chapter,
    });
  } catch (error) {
    console.error("CREATE_CHAPTER_ERROR:", error);

    return NextResponse.json(
      { message: "Chapter хадгалах үед server алдаа гарлаа" },
      { status: 500 }
    );
  }
}