"use client";

import { useState } from "react";

const plans = [
  {
    months: 1,
    label: "1 сар",
    amount: 5000,
  },
  {
    months: 2,
    label: "2 сар",
    amount: 9000,
  },
  {
    months: 3,
    label: "3 сар",
    amount: 13000,
  },
  {
    months: 6,
    label: "6 сар",
    amount: 22000,
  },
  {
    months: 12,
    label: "12 сар",
    amount: 35000,
  },
];

export default function PremiumPage() {
  const [loading, setLoading] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [payment, setPayment] = useState<any>(null);
  const [message, setMessage] = useState("");

  async function createPayment(months: number) {
    try {
      setLoading(months);
      setMessage("");

      const res = await fetch("/api/premium/wire/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ months }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Төлбөр үүсгэхэд алдаа гарлаа");
        return;
      }

      setPayment(data);
      setMessage("Төлбөр үүслээ. QR уншуулаад төлнө үү.");
    } catch (error) {
      console.error(error);
      setMessage("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setLoading(null);
    }
  }

  async function checkPayment() {
    if (!payment?.orderId || !payment?.paymentIntentId) {
      setMessage("Шалгах төлбөр алга байна");
      return;
    }

    try {
      setChecking(true);
      setMessage("");

      const res = await fetch("/api/premium/wire/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: payment.orderId,
          paymentIntentId: payment.paymentIntentId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Төлбөр шалгахад алдаа гарлаа");
        return;
      }

      setMessage(data.message || "Төлбөр шалгагдлаа");

      if (data.paid) {
        setTimeout(() => {
          window.location.href = "/profile";
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      setMessage("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070711] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Mangazet Premium</h1>
          <p className="mt-2 text-white/60">
            Premium эрх аваад бүх chapter-ийг уншаарай.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm">
            {message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-5">
          {plans.map((plan) => (
            <div
              key={plan.months}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <h2 className="text-xl font-bold">{plan.label}</h2>
              <p className="mt-2 text-2xl font-black">
                {plan.amount.toLocaleString()}₮
              </p>

              <button
                onClick={() => createPayment(plan.months)}
                disabled={loading !== null}
                className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold hover:bg-violet-500 disabled:opacity-60"
              >
                {loading === plan.months ? "Үүсгэж байна..." : "Premium авах"}
              </button>
            </div>
          ))}
        </div>

        {payment && (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Төлбөрийн мэдээлэл</h2>

            <div className="mt-4 space-y-2 text-sm text-white/70">
              <p>
                Захиалга:{" "}
                <span className="text-white">#{payment.orderId}</span>
              </p>
              <p>
                Дүн:{" "}
                <span className="text-white">
                  {payment.amount?.toLocaleString()}₮
                </span>
              </p>
              <p>
                Гүйлгээний утга:{" "}
                <span className="text-white">
                  {payment.transactionRemark}
                </span>
              </p>
              <p>
                PaymentIntent:{" "}
                <span className="break-all text-white">
                  {payment.paymentIntentId}
                </span>
              </p>
            </div>

            {payment.qrImage && (
              <div className="mt-5 flex justify-center">
                <img
                  src={payment.qrImage}
                  alt="QPay QR"
                  className="h-64 w-64 rounded-xl bg-white p-3"
                />
              </div>
            )}

            {!payment.qrImage && payment.qrText && (
              <div className="mt-5 rounded-xl bg-black/30 p-4">
                <p className="text-xs text-white/50">QR text:</p>
                <p className="mt-2 break-all text-sm">{payment.qrText}</p>
              </div>
            )}

            {payment.deeplink && (
              <a
                href={payment.deeplink}
                className="mt-5 block rounded-xl bg-emerald-600 px-4 py-3 text-center font-semibold hover:bg-emerald-500"
              >
                Банкны апп-аар төлөх
              </a>
            )}

            <button
              onClick={checkPayment}
              disabled={checking}
              className="mt-4 w-full rounded-xl bg-white px-4 py-3 font-semibold text-black hover:bg-white/90 disabled:opacity-60"
            >
              {checking ? "Шалгаж байна..." : "Төлбөр шалгах"}
            </button>

            <details className="mt-5">
              <summary className="cursor-pointer text-sm text-white/50">
                Debug raw response харах
              </summary>
              <pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-white/70">
                {JSON.stringify(payment.raw || payment, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </main>
  );
}