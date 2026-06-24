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

type WirePaymentData = {
  orderId: number;
  paymentUrl?: string | null;
  qrImageUrl?: string | null;
  qrText?: string | null;
  appLinks?: {
    name: string;
    url: string;
    logo?: string;
  }[];
};

export default function PremiumPage() {
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const [checkingOrderId, setCheckingOrderId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [paymentData, setPaymentData] = useState<WirePaymentData | null>(null);
  const [debug, setDebug] = useState<any>(null);

  async function createWirePayment(months: number) {
    try {
      setMessage("");
      setDebug(null);
      setPaymentData(null);
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

      setDebug(data);
      setPaymentData({
        orderId: data.orderId,
        paymentUrl: data.paymentUrl,
        qrImageUrl: data.qrImageUrl,
        qrText: data.qrText,
        appLinks: data.appLinks || [],
      });

      setMessage(
        "Төлбөр үүслээ. QPay-р төлөөд, дараа нь төлбөр шалгах товч дарна уу."
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
            Wire.mn PaymentIntent + Webhook ашиглан төлбөр төлсний дараа premium
            эрх автоматаар идэвхжинэ.
          </p>
        </div>

        {message ? (
          <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-sm font-semibold text-yellow-200">
            {message}
          </div>
        ) : null}

        {paymentData ? (
          <div className="mx-auto mb-10 max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center shadow-2xl shadow-black/30">
            <h2 className="text-2xl font-black text-yellow-400">
              QPay төлбөр
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Төлбөр төлөгдсөний дараа webhook автоматаар premium эрх
              идэвхжүүлнэ. Хэрвээ удаж байвал “Төлбөр шалгах” дар.
            </p>

            {paymentData.qrImageUrl ? (
              <div className="mt-5 flex justify-center">
                <img
                  src={paymentData.qrImageUrl}
                  alt="QPay QR"
                  className="h-64 w-64 rounded-2xl bg-white object-contain p-3"
                />
              </div>
            ) : null}

            {paymentData.qrText ? (
              <div className="mt-5 rounded-2xl bg-black/40 p-4 text-left">
                <p className="mb-2 text-sm font-bold text-zinc-300">
                  QR text:
                </p>
                <p className="break-words text-xs text-zinc-400">
                  {paymentData.qrText}
                </p>
              </div>
            ) : null}

            {paymentData.paymentUrl ? (
              <a
                href={paymentData.paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
              >
                QPay-р төлөх
              </a>
            ) : null}

            {paymentData.appLinks && paymentData.appLinks.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {paymentData.appLinks.map((app, index) => (
                  <a
                    key={`${app.name}-${index}`}
                    href={app.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15"
                  >
                    {app.logo ? (
                      <img
                        src={app.logo}
                        alt={app.name}
                        className="h-6 w-6 rounded"
                      />
                    ) : null}
                    {app.name}
                  </a>
                ))}
              </div>
            ) : null}

            <button
              onClick={() => checkPayment(paymentData.orderId)}
              disabled={checkingOrderId === paymentData.orderId}
              className="mt-5 w-full rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkingOrderId === paymentData.orderId
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
                {loadingPlan === plan.months
                  ? "Үүсгэж байна..."
                  : "Wire-р төлөх"}
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