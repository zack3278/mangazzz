import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ChapterBody = {
  comicId?: string | number;
  mangaId?: string | number;
  title?: string;
  chapterTitle?: string;
  number?: number | string;
  chapterNumber?: number | string;
  content?: string;
  images?: string[];
  imageUrls?: string[];
};

function normalizeImages(body: ChapterBody): string[] {
  if (Array.isArray(body.imageUrls) && body.imageUrls.length > 0) {
    return body.imageUrls
      .map((url) => String(url).trim())
      .filter(Boolean);
  }

  if (Array.isArray(body.images) && body.images.length > 0) {
    return body.images
      .map((url) => String(url).trim())
      .filter(Boolean);
  }

  if (typeof body.content === "string" && body.content.trim()) {
    return body.content
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  return [];
}

export async function GET() {
  try {
    const chapters = await prisma.chapter.findMany({
      orderBy: {
        number: "asc",
      },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
        comic: true,
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
    const body = (await req.json()) as ChapterBody;

    console.log("CHAPTER_CREATE_BODY:", body);

    const rawComicId = body.comicId ?? body.mangaId;
    const comicId = Number(rawComicId);

    const title = String(body.title || body.chapterTitle || "").trim();

    const rawNumber = body.number ?? body.chapterNumber;
    const number = Number(rawNumber);

    const imageUrls = normalizeImages(body);

    if (!comicId || Number.isNaN(comicId)) {
      return NextResponse.json(
        {
          message: "Manga сонгогдоогүй байна",
          debug: {
            rawComicId,
            comicId,
            title,
            number,
            imageCount: imageUrls.length,
          },
        },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          message: "Chapter нэр дутуу байна",
          debug: {
            comicId,
            title,
            number,
            imageCount: imageUrls.length,
          },
        },
        { status: 400 }
      );
    }

    if (!number || Number.isNaN(number) || number <= 0) {
      return NextResponse.json(
        {
          message: "Chapter дугаар дутуу эсвэл буруу байна",
          debug: {
            comicId,
            title,
            number,
            imageCount: imageUrls.length,
          },
        },
        { status: 400 }
      );
    }

    if (imageUrls.length === 0) {
      return NextResponse.json(
        {
          message: "Chapter зураг дутуу байна",
          debug: {
            comicId,
            title,
            number,
            imageCount: imageUrls.length,
          },
        },
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

    const sameChapter = await prisma.chapter.findUnique({
      where: {
        comicId_number: {
          comicId,
          number,
        },
      },
    });

    if (sameChapter) {
      return NextResponse.json(
        {
          message: "Энэ manga дээр ийм дугаартай chapter аль хэдийн байна",
        },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.create({
      data: {
        comicId,
        title,
        number,
        images: {
          create: imageUrls.map((imageUrl, index) => ({
            imageUrl,
            order: index + 1,
          })),
        },
      },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
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