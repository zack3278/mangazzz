import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, code } = await req.json();

    if (!name || !email || !password || !code) {
      return NextResponse.json(
        { message: "Мэдээлэл дутуу байна" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Нууц үг хамгийн багадаа 6 тэмдэгт байна" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return NextResponse.json(
        { message: "Энэ email аль хэдийн бүртгэлтэй байна" },
        { status: 400 }
      );
    }

    const otp = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        type: "REGISTER",
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otp) {
      return NextResponse.json(
        { message: "OTP код буруу эсвэл хугацаа дууссан байна" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return NextResponse.json({
      message: "Бүртгэл амжилттай үүслээ",
    });
  } catch (error) {
    console.error("REGISTER VERIFY ERROR:", error);

    return NextResponse.json(
      { message: "Бүртгүүлэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}