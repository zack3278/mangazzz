"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

const plans = [
  {
    months: 1,
    name: "1 сар",
    price: "5,000₮",
    description: "Premium эрх",
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

type AppLink = {
  name: string;
  url: string;
  logo?: string;
};

type PaymentData = {
  orderId: number;
  paymentIntentId?: string;
  paymentUrl?: string | null;
  qrText?: string | null;
  appLinks?: AppLink[];
};

export default function PremiumPage() {
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const [checkingOrderId, setCheckingOrderId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [debug, setDebug] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function generateQr() {
      try {
        setQrDataUrl("");

        const value =
          paymentData?.qrText ||
          paymentData?.paymentUrl ||
          "";

        if (!value) return;

        const url = await QRCode.toDataURL(value, {
          width: 340,
          margin: 1,
        });

        if (active) {
          setQrDataUrl(url);
        }
      } catch (error) {
        console.error("QR generate error:", error);
      }
    }

    generateQr();

    return () => {
      active = false;
    };
  }, [paymentData?.qrText, paymentData?.paymentUrl]);

  async function createWirePayment(months: number) {
    try {
      setMessage("");
      setDebug(null);
      setPaymentData(null);
      setQrDataUrl("");
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

      setPaymentData({
        orderId: data.orderId,
        paymentIntentId: data.paymentIntentId,
        paymentUrl: data.paymentUrl,
        qrText: data.qrText,
        appLinks: data.appLinks || [],
      });

      setDebug(data);
      setMessage(
        "Төлбөр үүслээ. QR кодоор төлөөд дараа нь “Төлбөр шалгах” дарна уу."
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
          </p>
        </div>

        {message ? (
          <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-sm font-semibold text-yellow-200">
            {message}
          </div>
        ) : null}

        {paymentData ? (
          <div className="mx-auto mb-10 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-yellow-400">
                  QPay төлбөр
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                </p>

                <div className="mt-3 space-y-1 text-sm text-zinc-300">
                  <p>
                    <span className="font-bold">Order ID:</span>{" "}
                    {paymentData.orderId}
                  </p>
                  {paymentData.paymentIntentId ? (
                    <p>
                      <span className="font-bold">PaymentIntent ID:</span>{" "}
                      {paymentData.paymentIntentId}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#06111d] p-5">
              {(qrDataUrl || paymentData.qrText) ? (
                <div className="flex justify-center">
                  <div className="rounded-2xl bg-white p-5">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QPay QR"
                        className="h-[320px] w-[320px] object-contain"
                      />
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-black/30 p-6 text-center text-sm text-zinc-400">
                  QR код олдсонгүй. Доорх QPay link ашиглаж төлнө үү.
                </div>
              )}

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {paymentData.paymentUrl ? (
                  <a
                    href={paymentData.paymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
                  >
                    QPay-р төлөх
                  </a>
                ) : null}
              </div>

              {paymentData.appLinks && paymentData.appLinks.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {paymentData.appLinks.map((app, index) => (
                    <a
                      key={`${app.name}-${index}`}
                      href={app.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold transition hover:bg-white/[0.08]"
                    >
                      {app.logo ? (
                        <img
                          src={app.logo}
                          alt={app.name}
                          className="h-7 w-7 rounded-md object-contain bg-white"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-md bg-white/10" />
                      )}

                      <span>{app.name}</span>
                    </a>
                  ))}
                </div>
              ) : null}

              <button
                onClick={() => checkPayment(paymentData.orderId)}
                disabled={checkingOrderId === paymentData.orderId}
                className="mt-6 w-full rounded-xl bg-emerald-500 px-6 py-4 text-lg font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkingOrderId === paymentData.orderId
                  ? "Шалгаж байна..."
                  : "ТӨЛБӨР ШАЛГАХ"}
              </button>
            </div>
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
                  : "Төлөх"}
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