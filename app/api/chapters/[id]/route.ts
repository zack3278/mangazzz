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
        { message: "Зөвхөн ADMIN chapter устгана" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.chapter.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      message: "Chapter амжилттай устлаа",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Chapter устгахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: Props) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Зөвхөн ADMIN chapter засна" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { title, number, images } = await req.json();

    if (!title || !number || !images?.length) {
      return NextResponse.json(
        { message: "Chapter title, number, images шаардлагатай" },
        { status: 400 }
      );
    }

    const chapterId = Number(id);

    await prisma.chapterImage.deleteMany({
      where: {
        chapterId,
      },
    });

    const chapter = await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        title,
        number: Number(number),
        images: {
          create: images.map((imageUrl: string, index: number) => ({
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
      message: "Chapter амжилттай засагдлаа",
      chapter,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Chapter засахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}