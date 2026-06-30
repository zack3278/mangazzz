import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

import { getCurrentUser } from "@/lib/auth";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";

export const runtime = "nodejs";

function getFileExt(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (!ext) return "png";

  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
    return ext;
  }

  return "png";
}

function getPublicUrl(key: string) {
  const baseUrl = R2_PUBLIC_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    return "";
  }

  return `${baseUrl}/${key}`;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Нэвтрээгүй байна" },
        { status: 401 }
      );
    }

    if (
      !process.env.R2_ACCOUNT_ID ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY ||
      !process.env.R2_BUCKET_NAME ||
      !process.env.R2_PUBLIC_URL
    ) {
      return NextResponse.json(
        {
          message: "R2 тохиргоо дутуу байна",
          missing: {
            R2_ACCOUNT_ID: !process.env.R2_ACCOUNT_ID,
            R2_ACCESS_KEY_ID: !process.env.R2_ACCESS_KEY_ID,
            R2_SECRET_ACCESS_KEY: !process.env.R2_SECRET_ACCESS_KEY,
            R2_BUCKET_NAME: !process.env.R2_BUCKET_NAME,
            R2_PUBLIC_URL: !process.env.R2_PUBLIC_URL,
          },
        },
        { status: 500 }
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
    const ext = getFileExt(file.name);

    const key = `profiles/${user.id}/${crypto.randomUUID()}.${ext}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const url = getPublicUrl(key);

    if (!url) {
      return NextResponse.json(
        { message: "R2_PUBLIC_URL тохируулагдаагүй байна" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Profile зураг R2 руу upload хийгдлээ",
      url,
      key,
    });
  } catch (error) {
    console.error("PROFILE_IMAGE_R2_UPLOAD_ERROR:", error);

    return NextResponse.json(
      { message: "R2 upload хийхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}