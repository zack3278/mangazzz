import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireEditorOrAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireEditorOrAdmin();

    if (!user) {
      return NextResponse.json(
        { message: "Зөвхөн EDITOR эсвэл ADMIN зураг upload хийнэ" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json(
        { message: "Файл сонгоно уу" },
        { status: 400 }
      );
    }

    if (!type || !["cover", "chapter"].includes(type)) {
      return NextResponse.json(
        { message: "Upload төрөл буруу байна" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name.replace(/\s+/g, "-").toLowerCase();
    const uniqueName = `${Date.now()}-${originalName}`;

    const folderName = type === "cover" ? "covers" : "chapters";

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      folderName
    );

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${folderName}/${uniqueName}`;

    return NextResponse.json({
      message: "Зураг upload амжилттай",
      url: publicUrl,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Upload хийхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}