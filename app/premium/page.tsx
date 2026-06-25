"use client";

import { useState } from "react";

type Plan = {
  months: number;
  price: number;
};

const plans: Plan[] = [
  { months: 1, price: 5000 },
  { months: 2, price: 9000 },
  { months: 3, price: 13000 },
  { months: 6, price: 22000 },
  { months: 12, price: 35000 },
];

function getPaymentUrl(data: any) {
  return (
    data?.checkoutUrl ||
    data?.paymentUrl ||
    data?.data?.checkoutUrl ||
    data?.data?.paymentUrl ||
    data?.data?.payment_url ||
    data?.data?.invoiceUrl ||
    data?.data?.invoice_url ||
    data?.data?.redirectUrl ||
    data?.data?.redirect_url ||
    data?.data?.url ||
    null
  );
}

function getQrText(data: any) {
  return (
    data?.qrText ||
    data?.data?.qrText ||
    data?.data?.qr_text ||
    data?.data?.qpayQrText ||
    data?.data?.qpay_qr_text ||
    data?.data?.qr ||
    null
  );
}

export default function PremiumPage() {
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [debugData, setDebugData] = useState<any>(null);
  const [qrText, setQrText] = useState("");

  const buyPremium = async (months: number, amount: number) => {
    try {
      setLoadingPlan(months);
      setMessage("");
      setDebugData(null);
      setQrText("");

      const res = await fetch("/api/premium/wire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          months,
          amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("WIRE ERROR:", data);
        setDebugData(data);

        if (data.missing) {
          const missingKeys = Object.entries(data.missing)
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(", ");

          setMessage(`Wire.mn ENV дутуу байна: ${missingKeys}`);
          return;
        }

        setMessage(
          `${data.message || "Wire.mn алдаа гарлаа"}${
            data.error ? `: ${data.error}` : ""
          }${data.cause?.code ? ` (${data.cause.code})` : ""}${
            data.status ? ` Status: ${data.status}` : ""
          }`
        );
        return;
      }

      const paymentUrl = getPaymentUrl(data);
      const responseQrText = getQrText(data);

      if (responseQrText) {
        setQrText(responseQrText);
        setMessage("Төлбөрийн QR мэдээлэл амжилттай үүслээ.");
        setDebugData(data);
        return;
      }

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      console.log("WIRE RESPONSE:", data);
      setDebugData(data);
      setMessage("Wire.mn response ирсэн боловч payment URL эсвэл QR олдсонгүй");
    } catch (error: any) {
      console.error(error);
      setMessage(
        `Wire.mn API холболт амжилтгүй боллоо: ${
          error?.message || String(error)
        }`
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#070711] px-4 py-14 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight">
            Mangazet Premium
          </h1>

          <p className="mt-3 text-lg text-zinc-400">
            Premium эрх аваад бүх chapter-ийг уншаарай.
          </p>
        </div>

        {message && (
          <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-5 py-5 text-center font-semibold text-white">
            {message}
          </div>
        )}

        {qrText && (
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-purple-700/50 bg-purple-950/30 p-5 text-center">
            <p className="text-lg font-black text-white">QR / Payment text</p>

            <textarea
              readOnly
              value={qrText}
              className="mt-4 h-40 w-full rounded-xl border border-zinc-700 bg-black/40 p-4 text-sm text-zinc-200 outline-none"
            />

            <p className="mt-3 text-sm text-zinc-400">
              Энэ QR text-ийг Wire/QPay app дээр ашиглах боломжтой бол ашиглана.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {plans.map((plan) => (
            <div
              key={plan.months}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg"
            >
              <h2 className="text-2xl font-black">{plan.months} сар</h2>

              <p className="mt-4 text-3xl font-black">
                {plan.price.toLocaleString()}₮
              </p>

              <button
                onClick={() => buyPremium(plan.months, plan.price)}
                disabled={loadingPlan !== null}
                className="mt-7 w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-4 text-lg font-black text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingPlan === plan.months
                  ? "Үүсгэж байна..."
                  : "Premium авах"}
              </button>
            </div>
          ))}
        </div>

        {debugData && (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black/40 p-5">
            <p className="font-black text-red-300">Debug response</p>

            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-black p-4 text-xs text-zinc-300">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </main>
  );
}