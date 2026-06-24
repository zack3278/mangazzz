import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp, otpExpiresAt } from "@/lib/otp";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email шаардлагатай" },
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

    const code = generateOtp();

    await prisma.otpCode.create({
      data: {
        email,
        code,
        type: "RESET_PASSWORD",
        expiresAt: otpExpiresAt(),
      },
    });

    await sendMail(
      email,
      "Mangazet нууц үг сэргээх OTP код",
      `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Mangazet нууц үг сэргээх</h2>
        <p>Таны нууц үг сэргээх OTP код:</p>
        <h1 style="letter-spacing: 6px;">${code}</h1>
        <p>Энэ код 10 минутын дараа хүчингүй болно.</p>
      </div>
      `
    );

    return NextResponse.json({
      message: "Нууц үг сэргээх OTP код email рүү илгээгдлээ",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        message: "OTP илгээхэд алдаа гарлаа",
        error: String(error),
      },
      { status: 500 }
    );
  }
}