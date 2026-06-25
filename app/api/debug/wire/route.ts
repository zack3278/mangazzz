import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.WIRE_BASE_URL || "https://api.wirepayment.mn";
  const key = process.env.WIRE_SECRET_KEY || process.env.WIRE_API_KEY;

  try {
    if (!key) {
      return NextResponse.json(
        {
          ok: false,
          message: "WIRE_SECRET_KEY эсвэл WIRE_API_KEY байхгүй байна",
        },
        { status: 500 }
      );
    }

    const url = `${baseUrl}/v1/payment_intents?limit=1`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    });

    const text = await res.text();

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      url,
      body: text,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : String(error),
        cause:
          error instanceof Error && "cause" in error
            ? String((error as any).cause)
            : null,
        baseUrl,
      },
      { status: 500 }
    );
  }
}