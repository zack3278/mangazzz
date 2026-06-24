"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Navbar from "@/components/Navbar";

const plans = [
  { months: 1, name: "1 сар", price: "5,000₮", description: "Premium эрх" },
  { months: 2, name: "2 сар", price: "9,000₮", description: "2 сарын premium эрх" },
  { months: 3, name: "3 сар", price: "13,000₮", description: "Илүү хэмнэлттэй багц" },
  { months: 6, name: "6 сар", price: "22,000₮", description: "Хагас жилийн premium эрх" },
  { months: 12, name: "12 сар", price: "35,000₮", description: "Хамгийн ашигтай багц" },
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
  const [debug, setDebug] = useState<unknown>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    let active = true;

    async function generateQr() {
      try {
        setQrDataUrl("");

        const value = paymentData?.qrText || paymentData?.paymentUrl || "";

        if (!value) return;

        const url = await QRCode.toDataURL(value, {
          width: 380,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
    <main className="site-shell min-h-screen text-white">
      <Navbar />

      <section className="container-soft py-10">
        <div className="glass-panel rounded-[2rem] p-6 md:p-10">
          <span className="badge badge-gold">MANGAZET PREMIUM</span>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Premium эрх авах
          </h1>

          <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-zinc-300">
            QPay QR-р төлөөд premium эрхээ автоматаар идэвхжүүл. Төлбөр
            амжилттай болсны дараа “Төлбөр шалгах” дарна.
          </p>
        </div>

        {message ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/7 p-5 text-sm font-bold text-zinc-100">
            {message}
          </div>
        ) : null}

        {paymentData ? (
          <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-panel rounded-[2rem] p-6 text-center">
              <span className="badge badge-green">QPay төлбөр</span>

              <h2 className="mt-4 text-2xl font-black">QR уншуулж төлнө үү</h2>

              <p className="mt-2 text-sm font-bold text-zinc-500">
                Order ID: {paymentData.orderId}
              </p>

              <div className="mx-auto mt-6 flex w-fit justify-center rounded-[2rem] bg-white p-5 shadow-[0_25px_80px_rgba(255,255,255,0.12)]">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QPay QR"
                    className="h-[300px] w-[300px] md:h-[380px] md:w-[380px]"
                  />
                ) : (
                  <div className="flex h-[300px] w-[300px] items-center justify-center text-center text-sm font-black text-black">
                    QR үүсгэж байна...
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => checkPayment(paymentData.orderId)}
                disabled={checkingOrderId === paymentData.orderId}
                className="primary-btn mt-6 w-full bg-gradient-to-r from-emerald-400 to-lime-300 text-black"
              >
                {checkingOrderId === paymentData.orderId
                  ? "Шалгаж байна..."
                  : "ТӨЛБӨР ШАЛГАХ"}
              </button>
            </div>

            <div className="glass-card rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">QPay app link</h2>

              <p className="mt-2 text-sm font-medium leading-6 text-zinc-400">
                QR уншихгүй байвал доорх link-үүдээр төлж болно.
              </p>

              {paymentData.paymentUrl ? (
                <a
                  href={paymentData.paymentUrl}
                  target="_blank"
                  className="primary-btn mt-5 w-full"
                  rel="noreferrer"
                >
                  QPay-р төлөх
                </a>
              ) : null}

              {paymentData.appLinks && paymentData.appLinks.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {paymentData.appLinks.map((app, index) => (
                    <a
                      key={`${app.name}-${index}`}
                      href={app.url}
                      target="_blank"
                      rel="noreferrer"
                      className="secondary-btn justify-start"
                    >
                      {app.logo ? (
                        <img
                          src={app.logo}
                          alt={app.name}
                          className="h-7 w-7 rounded-lg"
                        />
                      ) : null}
                      {app.name}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {plans.map((plan) => (
            <div
              key={plan.months}
              className="glass-card rounded-[2rem] p-5 transition hover:-translate-y-1 hover:border-red-400/40"
            >
              <span className="badge">{plan.months} month</span>

              <h2 className="mt-4 text-3xl font-black">{plan.name}</h2>

              <p className="mt-2 min-h-10 text-sm font-medium leading-6 text-zinc-400">
                {plan.description}
              </p>

              <p className="mt-6 text-3xl font-black text-amber-200">
                {plan.price}
              </p>

              <button
                type="button"
                onClick={() => createWirePayment(plan.months)}
                disabled={loadingPlan === plan.months}
                className="primary-btn mt-6 w-full"
              >
                {loadingPlan === plan.months ? "Үүсгэж байна..." : "Төлөх"}
              </button>
            </div>
          ))}
        </section>

        {debug ? (
          <details className="mt-8 glass-card rounded-3xl p-5">
            <summary className="cursor-pointer text-sm font-black text-zinc-300">
              Wire debug response
            </summary>

            <pre className="mt-4 max-h-80 overflow-auto rounded-2xl bg-black/60 p-4 text-xs text-zinc-300">
              {JSON.stringify(debug, null, 2)}
            </pre>
          </details>
        ) : null}
      </section>
    </main>
  );
}