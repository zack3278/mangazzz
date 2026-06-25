import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Зураг сонгоно уу" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Зөвхөн зураг upload хийнэ" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Зураг 5MB-аас бага байх ёстой" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";

    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
      ? ext
      : "png";

    const fileName = `${user.id}-${Date.now()}.${safeExt}`;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "profiles"
    );

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const url = `/uploads/profiles/${fileName}`;

    return NextResponse.json({
      message: "Зураг upload хийгдлээ",
      url,
    });
  } catch (error) {
    console.error("PROFILE_IMAGE_UPLOAD_ERROR:", error);

    return NextResponse.json(
      { message: "Зураг upload хийхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}