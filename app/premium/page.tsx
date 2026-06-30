"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";

type Plan = {
  months: number;
  price: number;
  name: string;
  subtitle: string;
  label: string;
  save?: string;
  best?: boolean;
};

const plans: Plan[] = [
  {
    months: 1,
    price: 5000,
    name: "Rookie",
    subtitle: "Туршиж үзэх багц",
    label: "START",
  },
  {
    months: 2,
    price: 9000,
    name: "Scout",
    subtitle: "Богино хугацааны уншлага",
    label: "BASIC",
    save: "1,000₮ save",
  },
  {
    months: 3,
    price: 13000,
    name: "Hunter",
    subtitle: "Хамгийн тохиромжтой",
    label: "POPULAR",
    save: "2,000₮ save",
    best: true,
  },
  {
    months: 6,
    price: 22000,
    name: "Shadow",
    subtitle: "Урт хугацааны уншигч",
    label: "PRO",
    save: "8,000₮ save",
  },
  {
    months: 12,
    price: 35000,
    name: "Legend",
    subtitle: "Бүтэн жилийн эрх",
    label: "YEARLY",
    save: "25,000₮ save",
  },
];

function formatPrice(price: number) {
  return `${price.toLocaleString()}₮`;
}

function getPaymentUrl(data: any): string | null {
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

function getQrText(data: any): string | null {
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
  const [selectedMonths, setSelectedMonths] = useState(3);
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [qrText, setQrText] = useState("");
  const [debugData, setDebugData] = useState<any>(null);

  const selectedPlan = useMemo(() => {
    return plans.find((plan) => plan.months === selectedMonths) || plans[2];
  }, [selectedMonths]);

  const buyPremium = async (months: number, amount: number) => {
    try {
      setLoadingPlan(months);
      setMessage("");
      setQrText("");
      setDebugData(null);

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

        if (data?.missing) {
          const missingKeys = Object.entries(data.missing)
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(", ");

          setMessage(`Wire.mn ENV дутуу байна: ${missingKeys}`);
          return;
        }

        setMessage(
          `${data?.message || "Wire.mn алдаа гарлаа"}${
            data?.error ? `: ${data.error}` : ""
          }`
        );
        return;
      }

      const paymentUrl = getPaymentUrl(data);
      const responseQrText = getQrText(data);

      if (responseQrText) {
        setQrText(responseQrText);
        setMessage("Төлбөрийн мэдээлэл амжилттай үүслээ.");
        setDebugData(data);
        return;
      }

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      console.log("WIRE RESPONSE:", data);
      setDebugData(data);
      setMessage("Payment URL эсвэл QR олдсонгүй.");
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
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0b0a07_0%,#050505_45%,#130d02_100%)]" />
        <div className="absolute left-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-yellow-400/15 blur-[90px]" />
        <div className="absolute right-[-140px] top-[160px] h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-[100px]" />
        <div className="absolute bottom-[-180px] left-1/3 h-[360px] w-[360px] rounded-full bg-yellow-300/10 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] px-4 py-4">
        <Navbar />

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#10100d]/90 p-5 shadow-2xl shadow-black/50 sm:p-8">
            <div className="absolute right-6 top-6 hidden rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-xs font-black text-yellow-300 sm:block">
              MANGAZET VIP
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_18px_rgba(250,204,21,0.9)]" />
                <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-300">
                  Premium Gate
                </span>
              </div>

              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
                Unlock the
                <span className="block bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Manga Vault
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm font-semibold leading-7 text-zinc-400 sm:text-base">
                Premium эрхээр хаалттай chapter-уудыг нээж, дуртай мангагаа
                тасралтгүй уншаарай. Сонгосон багц чинь доорх VIP ticket дээр
                шууд харагдана.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ["∞", "Бүх chapter"],
                  ["VIP", "Premium access"],
                  ["⚡", "Шууд идэвхжих"],
                ].map(([big, small]) => (
                  <div
                    key={small}
                    className="rounded-3xl border border-white/10 bg-black/40 p-4"
                  >
                    <p className="text-2xl font-black text-yellow-300">
                      {big}
                    </p>
                    <p className="mt-1 text-xs font-bold text-zinc-500">
                      {small}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    buyPremium(selectedPlan.months, selectedPlan.price)
                  }
                  disabled={loadingPlan !== null}
                  className="rounded-full bg-yellow-400 px-7 py-4 text-sm font-black text-black shadow-xl shadow-yellow-500/20 transition hover:scale-105 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingPlan === selectedPlan.months
                    ? "Төлбөр үүсгэж байна..."
                    : "Сонгосон эрх авах"}
                </button>

                <Link
                  href="/"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-black text-white transition hover:bg-white/[0.08]"
                >
                  Нүүр хуудас
                </Link>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[-55px] right-[-35px] text-[170px] font-black leading-none text-white/[0.03] sm:text-[240px]">
              VIP
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[34px] border border-yellow-400/25 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 p-1 shadow-2xl shadow-yellow-500/10">
            <div className="relative min-h-full overflow-hidden rounded-[30px] bg-[#090909] p-6 sm:p-8">
              <div className="absolute -left-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#050505]" />
              <div className="absolute -right-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#050505]" />

              <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-yellow-400/25" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                      VIP Ticket
                    </p>
                    <h2 className="mt-4 text-5xl font-black leading-none sm:text-6xl">
                      {selectedPlan.name}
                    </h2>
                    <p className="mt-3 text-sm font-bold text-zinc-400">
                      {selectedPlan.subtitle}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-yellow-400 px-4 py-3 text-center text-black">
                    <p className="text-xs font-black">PASS</p>
                    <p className="text-2xl font-black">
                      {selectedPlan.months}M
                    </p>
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-bold text-zinc-500">PRICE</p>
                    <p className="mt-2 text-3xl font-black text-yellow-300">
                      {formatPrice(selectedPlan.price)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-bold text-zinc-500">TYPE</p>
                    <p className="mt-2 text-3xl font-black">
                      {selectedPlan.label}
                    </p>
                  </div>
                </div>

                <div className="my-8 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                <div className="space-y-3">
                  {[
                    "Premium chapter-ууд нээгдэнэ",
                    "Profile дээр эрхийн хугацаа харагдана",
                    "Wire payment-р төлбөр үүсгэнэ",
                  ].map((text) => (
                    <div
                      key={text}
                      className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-black">
                        ✓
                      </span>
                      <p className="text-sm font-bold text-zinc-300">{text}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() =>
                    buyPremium(selectedPlan.months, selectedPlan.price)
                  }
                  disabled={loadingPlan !== null}
                  className="mt-8 w-full rounded-3xl bg-yellow-400 px-5 py-5 text-sm font-black text-black transition hover:scale-[1.02] hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingPlan === selectedPlan.months
                    ? "Төлбөр үүсгэж байна..."
                    : `${selectedPlan.months} сарын VIP эрх авах`}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                Select pass
              </p>
              <h2 className="mt-2 text-2xl font-black">Багцаа сонго</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {plans.map((plan) => {
              const active = selectedPlan.months === plan.months;

              return (
                <button
                  key={plan.months}
                  onClick={() => setSelectedMonths(plan.months)}
                  className={`group relative overflow-hidden rounded-[28px] border p-5 text-left transition hover:-translate-y-1 ${
                    active
                      ? "border-yellow-400 bg-yellow-400 text-black shadow-2xl shadow-yellow-500/20"
                      : "border-white/10 bg-[#10100d] text-white hover:border-yellow-400/50"
                  }`}
                >
                  {plan.best && (
                    <span
                      className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[10px] font-black ${
                        active
                          ? "bg-black text-yellow-300"
                          : "bg-yellow-400 text-black"
                      }`}
                    >
                      BEST
                    </span>
                  )}

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black ${
                      active
                        ? "bg-black text-yellow-300"
                        : "bg-yellow-400 text-black"
                    }`}
                  >
                    {plan.months}
                  </div>

                  <p
                    className={`mt-5 text-xs font-black uppercase tracking-[0.25em] ${
                      active ? "text-black/60" : "text-yellow-300"
                    }`}
                  >
                    {plan.label}
                  </p>

                  <h3 className="mt-2 text-2xl font-black">{plan.name}</h3>

                  <p
                    className={`mt-2 min-h-10 text-xs font-bold leading-5 ${
                      active ? "text-black/65" : "text-zinc-500"
                    }`}
                  >
                    {plan.subtitle}
                  </p>

                  <p className="mt-5 text-3xl font-black">
                    {formatPrice(plan.price)}
                  </p>

                  {plan.save && (
                    <p
                      className={`mt-2 text-xs font-black ${
                        active ? "text-black/60" : "text-yellow-300"
                      }`}
                    >
                      {plan.save}
                    </p>
                  )}

                  <div
                    className={`mt-5 rounded-2xl px-4 py-3 text-center text-xs font-black ${
                      active
                        ? "bg-black text-white"
                        : "bg-white/[0.06] text-zinc-300 group-hover:bg-yellow-400 group-hover:text-black"
                    }`}
                  >
                    {active ? "Сонгогдсон" : "Сонгох"}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {message && (
          <div className="mt-5 rounded-3xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm font-bold text-yellow-100">
            {message}
          </div>
        )}

        {qrText && (
          <div className="mt-5 rounded-[28px] border border-white/10 bg-[#10100d] p-5">
            <p className="text-lg font-black text-yellow-300">
              QR / Payment text
            </p>

            <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/50 p-4 text-xs text-zinc-300">
              {qrText}
            </pre>
          </div>
        )}

        {debugData && (
          <details className="mt-5 rounded-[28px] border border-white/10 bg-black/40 p-5">
            <summary className="cursor-pointer text-sm font-black text-red-300">
              Debug response
            </summary>

            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-black p-4 text-xs text-zinc-300">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}