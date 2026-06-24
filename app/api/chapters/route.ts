import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth";

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

function normalizeImages(body: ChapterBody) {
  if (Array.isArray(body.images) && body.images.length > 0) {
    return body.images.map((url) => String(url).trim()).filter(Boolean);
  }

  if (Array.isArray(body.imageUrls) && body.imageUrls.length > 0) {
    return body.imageUrls.map((url) => String(url).trim()).filter(Boolean);
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
    const editor = await requireEditorOrAdmin();

    if (!editor) {
      return NextResponse.json(
        { message: "Зөвхөн ADMIN эсвэл EDITOR chapter нэмэх эрхтэй" },
        { status: 403 }
      );
    }

    const body = (await req.json()) as ChapterBody;

    const rawComicId = body.comicId || body.mangaId;
    const comicId = Number(rawComicId);

    const title = body.title || body.chapterTitle || "";
    const rawNumber = body.number || body.chapterNumber;
    const number = Number(rawNumber);

    const imageUrls = normalizeImages(body);

    if (!comicId || Number.isNaN(comicId)) {
      return NextResponse.json(
        { message: "Manga сонгогдоогүй байна" },
        { status: 400 }
      );
    }

    if (!title.trim()) {
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

    if (imageUrls.length === 0) {
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

    const sameChapter = await prisma.chapter.findFirst({
      where: {
        comicId,
        number,
      },
    });

    if (sameChapter) {
      return NextResponse.json(
        { message: "Энэ manga дээр ийм дугаартай chapter аль хэдийн байна" },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.create({
      data: {
        comicId,
        title: title.trim(),
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