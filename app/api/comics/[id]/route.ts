import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(req: Request, { params }: Props) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Зөвхөн ADMIN comic устгана" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.comic.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      message: "Comic амжилттай устлаа",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Comic устгахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: Props) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Зөвхөн ADMIN comic засна" },
        { status: 403 }
      );
    }

    const { id } = await params;

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

    const comic = await prisma.comic.update({
      where: {
        id: Number(id),
      },
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
      message: "Comic амжилттай засагдлээ",
      comic,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Comic засахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}