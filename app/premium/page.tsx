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

export default function PremiumPage() {
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const buyPremium = async (months: number, amount: number) => {
    try {
      setLoadingPlan(months);
      setMessage("");

      const res = await fetch("/api/premium/wire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ months, amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("WIRE ERROR:", data);

        if (data.missing) {
          setMessage(
            `Wire.mn ENV дутуу байна: ${Object.entries(data.missing)
              .filter(([, value]) => value)
              .map(([key]) => key)
              .join(", ")}`
          );
          return;
        }

        setMessage(
          data.message ||
            data.data?.message ||
            `Wire.mn алдаа гарлаа. Status: ${data.status || res.status}`
        );
        return;
      }

      const paymentUrl =
        data.checkoutUrl ||
        data.paymentUrl ||
        data.data?.checkoutUrl ||
        data.data?.paymentUrl ||
        data.data?.payment_url ||
        data.data?.invoiceUrl ||
        data.data?.invoice_url ||
        data.data?.redirectUrl ||
        data.data?.redirect_url ||
        data.data?.url;

      if (!paymentUrl) {
        console.log("WIRE RESPONSE:", data);
        setMessage("Wire.mn response ирсэн боловч payment URL олдсонгүй");
        return;
      }

      window.location.href = paymentUrl;
    } catch (error: any) {
      console.error(error);
      setMessage("Wire.mn API холболт амжилтгүй боллоо: fetch failed");
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
      </section>
    </main>
  );
}