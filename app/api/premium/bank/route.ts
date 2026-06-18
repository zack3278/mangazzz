import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const premiumPlans: Record<number, number> = {
  1: 5000,
  3: 13000,
  6: 24000,
  12: 44000,
};

const premiumPlanNames: Record<number, string> = {
  1: "1 сар",
  3: "3 сар",
  6: "6 сар",
  12: "1 жил",
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Эхлээд login хийнэ үү" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const months = Number(body.months);
    const transferInfo = String(body.transferInfo || "").trim();

    if (![1, 3, 6, 12].includes(months)) {
      return NextResponse.json(
        { message: "Premium plan буруу байна" },
        { status: 400 }
      );
    }

    if (!transferInfo) {
      return NextResponse.json(
        { message: "Гүйлгээний мэдээллээ бичнэ үү" },
        { status: 400 }
      );
    }

    const amount = premiumPlans[months];
    const planName = premiumPlanNames[months];

    console.log("BANK PREMIUM REQUEST:", {
      userId: user.id,
      email: user.email,
      months,
      planName,
      amount,
      transferInfo,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message:
        "Таны premium хүсэлт илгээгдлээ. Админ төлбөрийг шалгаад premium эрхийг идэвхжүүлнэ.",
      order: {
        userId: user.id,
        email: user.email,
        months,
        planName,
        amount,
        transferInfo,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Premium хүсэлт илгээхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}