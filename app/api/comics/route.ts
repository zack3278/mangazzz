import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

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
    console.error(error);

    return NextResponse.json(
      { message: "Comic авахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Зөвхөн ADMIN comic нэмэх эрхтэй" },
        { status: 403 }
      );
    }

    const {
      title,
      slug,
      description,
      coverImage,
      author,
      genre,
      genre2,
      genre3,
    } = await req.json();

    if (!title || !slug || !description || !coverImage || !genre) {
      return NextResponse.json(
        { message: "Title, slug, description, coverImage, genre шаардлагатай" },
        { status: 400 }
      );
    }

    const comic = await prisma.comic.create({
      data: {
        title,
        slug,
        description,
        coverImage,
        author: author || null,
        genre,
        genre2: genre2 || null,
        genre3: genre3 || null,
      },
    });

    return NextResponse.json({
      message: "Comic нэмэгдлээ",
      comic,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Comic нэмэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}