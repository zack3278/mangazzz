import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

export async function GET() {
  try {
    await sendMail(
      process.env.SMTP_USER || "өөрийнgmail@gmail.com",
      "Mangazet test mail",
      "<h1>Email амжилттай ажиллаж байна</h1>"
    );

    return NextResponse.json({
      message: "Email илгээгдлээ",
    });
  } catch (error) {
    console.error("TEST MAIL ERROR:", error);

    return NextResponse.json(
      {
        message: "Email илгээхэд алдаа гарлаа",
        error: String(error),
      },
      { status: 500 }
    );
  }
}