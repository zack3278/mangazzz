import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const comics = await prisma.comic.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        chapters: {
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
        },
      },
    });

    return NextResponse.json(comics);
  } catch (error) {
    console.error("GET_COMICS_ERROR:", error);

    return NextResponse.json(
      { message: "Comic авахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const editor = await requireEditorOrAdmin();

    if (!editor) {
      return NextResponse.json(
        { message: "Зөвхөн ADMIN эсвэл EDITOR comic нэмэх эрхтэй" },
        { status: 403 }
      );
    }

    const {
      title,
      slug,
      description,
      coverImage,
      bannerImage,
      author,
      genre,
      genre2,
      genre3,
      status,
    } = await req.json();

    if (!title || !slug || !description || !coverImage || !genre) {
      return NextResponse.json(
        {
          message: "Title, slug, description, coverImage, genre шаардлагатай",
        },
        { status: 400 }
      );
    }

    const cleanStatus = status === "COMPLETED" ? "COMPLETED" : "ONGOING";

    const exists = await prisma.comic.findUnique({
      where: {
        slug: String(slug).trim(),
      },
    });

    if (exists) {
      return NextResponse.json(
        { message: "Энэ slug аль хэдийн ашиглагдсан байна" },
        { status: 400 }
      );
    }

    const comic = await prisma.comic.create({
      data: {
        title: String(title).trim(),
        slug: String(slug).trim(),
        description: String(description).trim(),
        coverImage: String(coverImage).trim(),
        bannerImage: bannerImage ? String(bannerImage).trim() : null,
        author: author ? String(author).trim() : null,
        genre: String(genre).trim(),
        genre2: genre2 ? String(genre2).trim() : null,
        genre3: genre3 ? String(genre3).trim() : null,
        status: cleanStatus,
      },
    });

    return NextResponse.json({
      message: "Comic нэмэгдлээ",
      comic,
    });
  } catch (error) {
    console.error("CREATE_COMIC_ERROR:", error);

    return NextResponse.json(
      { message: "Comic нэмэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}