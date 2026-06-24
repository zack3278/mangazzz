import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Wire webhook endpoint is working",
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    console.log("WIRE WEBHOOK RAW:", rawBody);

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("WIRE WEBHOOK ERROR:", error);

    return NextResponse.json(
      {
        received: false,
        message: "Wire webhook error",
      },
      { status: 500 }
    );
  }
}