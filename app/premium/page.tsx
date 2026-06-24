"use client";

import { useState } from "react";

const plans = [
  {
    months: 1,
    name: "1 сар",
    price: "5,000₮",
    description: "Premium chapter унших эрх",
  },
  {
    months: 2,
    name: "2 сар",
    price: "9,000₮",
    description: "2 сарын premium эрх",
  },
  {
    months: 3,
    name: "3 сар",
    price: "13,000₮",
    description: "Илүү хэмнэлттэй багц",
  },
  {
    months: 6,
    name: "6 сар",
    price: "22,000₮",
    description: "Хагас жилийн premium эрх",
  },
  {
    months: 12,
    name: "12 сар",
    price: "35,000₮",
    description: "Хамгийн ашигтай багц",
  },
];

function findUrlFromAnyObject(value: any): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    if (value.startsWith("http")) return value;
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findUrlFromAnyObject(item);
      if (found) return found;
    }

    return null;
  }

  if (typeof value === "object") {
    const directUrl =
      value.url ||
      value.redirect_url ||
      value.redirectUrl ||
      value.checkout_url ||
      value.checkoutUrl ||
      value.payment_url ||
      value.paymentUrl ||
      value.deeplink ||
      value.deep_link ||
      value.qpay_url ||
      value.qpayUrl ||
      value.link;

    if (typeof directUrl === "string" && directUrl.startsWith("http")) {
      return directUrl;
    }

    for (const key of Object.keys(value)) {
      const found = findUrlFromAnyObject(value[key]);
      if (found) return found;
    }
  }

  return null;
}

export default function PremiumPage() {
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const [checkingOrderId, setCheckingOrderId] = useState<number | null>(null);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [debug, setDebug] = useState<any>(null);

  async function createWirePayment(months: number) {
    try {
      setMessage("");
      setDebug(null);
      setLoadingPlan(months);

      const res = await fetch("/api/premium/wire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ months }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Төлбөр үүсгэхэд алдаа гарлаа");
        setDebug(data);
        return;
      }

      setLastOrderId(data.orderId);
      setDebug(data);

      const url =
        data.redirectUrl ||
        findUrlFromAnyObject(data.nextAction) ||
        findUrlFromAnyObject(data.rawPaymentIntent);

      if (url) {
        setMessage("Төлбөр үүслээ. QPay/Wire төлбөрийн цонх руу шилжүүлж байна...");
        window.location.href = url;
        return;
      }

      setMessage(
        "Төлбөр үүслээ. Гэхдээ Wire-ээс төлбөр төлөх URL ирсэнгүй. Доорх debug мэдээллийг screenshot хийгээд явуул."
      );
    } catch (error) {
      console.error(error);
      setMessage("Wire төлбөр үүсгэхэд алдаа гарлаа");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function checkPayment(orderId: number) {
    try {
      setCheckingOrderId(orderId);
      setMessage("");

      const res = await fetch("/api/premium/wire/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Төлбөр шалгахад алдаа гарлаа");
        setDebug(data);
        return;
      }

      setMessage(data.message);
      setDebug(data);

      if (data.paid) {
        setTimeout(() => {
          window.location.href = "/profile";
        }, 1200);
      }
    } catch (error) {
      console.error(error);
      setMessage("Төлбөр шалгахад алдаа гарлаа");
    } finally {
      setCheckingOrderId(null);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
            MANGAZET PREMIUM
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Premium эрх авах
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Wire.mn ашиглан төлбөрөө төлөөд premium chapter-уудыг уншаарай.
          </p>
        </div>

        {message ? (
          <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-sm font-semibold text-yellow-200">
            {message}
          </div>
        ) : null}

        {lastOrderId ? (
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => checkPayment(lastOrderId)}
              disabled={checkingOrderId === lastOrderId}
              className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkingOrderId === lastOrderId
                ? "Шалгаж байна..."
                : "Төлбөр шалгах"}
            </button>
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {plans.map((plan) => (
            <div
              key={plan.months}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30"
            >
              <h2 className="text-2xl font-black">{plan.name}</h2>

              <p className="mt-2 text-sm text-zinc-400">
                {plan.description}
              </p>

              <div className="mt-6 text-3xl font-black text-yellow-400">
                {plan.price}
              </div>

              <button
                onClick={() => createWirePayment(plan.months)}
                disabled={loadingPlan === plan.months}
                className="mt-6 w-full rounded-xl bg-yellow-400 px-4 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingPlan === plan.months ? "Үүсгэж байна..." : "Wire-р төлөх"}
              </button>
            </div>
          ))}
        </div>

        {debug ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-black/40 p-5">
            <h2 className="mb-3 text-lg font-bold text-yellow-400">
              Wire debug response
            </h2>

            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black p-4 text-xs text-zinc-300">
              {JSON.stringify(debug, null, 2)}
            </pre>
          </div>
        ) : null}
      </section>
    </main>
  );
}