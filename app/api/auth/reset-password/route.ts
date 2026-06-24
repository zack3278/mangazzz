import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { message: "Мэдээлэл дутуу байна" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Шинэ нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Ийм email-тэй хэрэглэгч олдсонгүй" },
        { status: 404 }
      );
    }

    const otp = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        type: "RESET_PASSWORD",
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return NextResponse.json({
      message: "Нууц үг амжилттай шинэчлэгдлээ",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        message: "Нууц үг сэргээхэд алдаа гарлаа",
        error: String(error),
      },
      { status: 500 }
    );
  }
}