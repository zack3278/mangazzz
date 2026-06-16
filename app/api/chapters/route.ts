import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireEditorOrAdmin();

    if (!user) {
      return NextResponse.json(
        { message: "Зөвхөн EDITOR эсвэл ADMIN chapter нэмэх эрхтэй" },
        { status: 403 }
      );
    }

    const { title, number, comicId, images } = await req.json();

    if (!title || !number || !comicId || !images?.length) {
      return NextResponse.json(
        { message: "Chapter мэдээлэл дутуу байна" },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.create({
      data: {
        title,
        number: Number(number),
        comicId: Number(comicId),
        images: {
          create: images.map((imageUrl: string, index: number) => ({
            imageUrl,
            order: index + 1,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({
      message: "Chapter нэмэгдлээ",
      chapter,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Chapter нэмэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}