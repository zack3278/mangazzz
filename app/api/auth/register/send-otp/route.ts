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

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return NextResponse.json(
        { message: "Энэ email аль хэдийн бүртгэлтэй байна" },
        { status: 400 }
      );
    }

    const code = generateOtp();

    await prisma.otpCode.create({
      data: {
        email,
        code,
        type: "REGISTER",
        expiresAt: otpExpiresAt(),
      },
    });

    await sendMail(
      email,
      "Mangazet бүртгэлийн OTP код",
      `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Mangazet баталгаажуулах код</h2>
        <p>Таны бүртгэлийн OTP код:</p>
        <h1 style="letter-spacing: 6px;">${code}</h1>
        <p>Энэ код 10 минутын дараа хүчингүй болно.</p>
      </div>
      `
    );

    return NextResponse.json({
      message: "OTP код email рүү илгээгдлээ",
    });
  } catch (error) {
    console.error("REGISTER SEND OTP ERROR:", error);

    return NextResponse.json(
      { message: "OTP илгээхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}