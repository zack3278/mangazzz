import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { message: "Файл олдсонгүй" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Зөвхөн зураг upload хийнэ" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "jpg";
    const safeFolder = folder || "uploads";

    const key = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const url = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : key;

    return NextResponse.json({
      message: "Upload амжилттай",
      url,
      key,
    });
  } catch (error) {
    console.error("R2 upload error:", error);

    return NextResponse.json(
      { message: "R2 upload алдаа гарлаа" },
      { status: 500 }
    );
  }
}