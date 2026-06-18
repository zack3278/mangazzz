"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";

type PaymentMethod = "bank" | "qpay" | null;

type PremiumPlan = {
  months: 1 | 3 | 6 | 12;
  title: string;
  price: number;
  description: string;
};

const premiumPlans: PremiumPlan[] = [
  {
    months: 1,
    title: "1 сар",
    price: 5000,
    description: "Туршиж үзэхэд тохиромжтой.",
  },
  {
    months: 3,
    title: "3 сар",
    price: 13000,
    description: "1 сараар авахаас хямд.",
  },
  {
    months: 6,
    title: "6 сар",
    price: 24000,
    description: "Удаан уншдаг хэрэглэгчид тохиромжтой.",
  },
  {
    months: 12,
    title: "1 жил",
    price: 44000,
    description: "Хамгийн ашигтай premium багц.",
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("mn-MN").format(price) + "₮";
}

export default function PremiumPage() {
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>(premiumPlans[0]);
  const [transferInfo, setTransferInfo] = useState("");
  const [sending, setSending] = useState(false);

  async function sendBankRequest() {
    if (!transferInfo.trim()) {
      alert("Гүйлгээний мэдээлэл, өөрийн нэр эсвэл имэйлээ бичнэ үү.");
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/premium/bank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          months: selectedPlan.months,
          transferInfo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Premium хүсэлт илгээхэд алдаа гарлаа");
        return;
      }

      alert(
        data.message ||
          "Таны хүсэлт бүртгэгдлээ. Админ шалгаад premium эрх идэвхжүүлнэ."
      );

      setTransferInfo("");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-red-400">
          Premium эрх
        </p>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="text-4xl font-black md:text-6xl">
              Premium эрх аваад хязгааргүй унш
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-zinc-400">
              Premium эрхтэй хэрэглэгч бүх manga, manhwa, comic-ийн бүлгийг
              хязгааргүй унших боломжтой.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
                <h3 className="font-bold">Бүх бүлэг</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Premium бүлгүүдийг хязгааргүй уншина.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
                <h3 className="font-bold">Хугацаатай эрх</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  1 сар, 3 сар, 6 сар, 1 жилээр сонгоно.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
                <h3 className="font-bold">Premium badge</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Profile дээр premium badge харагдана.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-black">Premium багц сонгох</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {premiumPlans.map((plan) => (
                  <button
                    key={plan.months}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      selectedPlan.months === plan.months
                        ? "border-red-500 bg-red-500/10"
                        : "border-white/10 bg-zinc-950 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-black">{plan.title}</h3>
                      <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold">
                        {formatPrice(plan.price)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-zinc-400">
                      {plan.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <div className="rounded-2xl bg-zinc-950 p-5">
              <p className="text-sm text-zinc-400">Сонгосон багц</p>
              <h2 className="mt-2 text-3xl font-black">
                {selectedPlan.title} — {formatPrice(selectedPlan.price)}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Админ төлбөрийг шалгасны дараа premium эрхийг идэвхжүүлнэ.
              </p>
            </div>

            <h2 className="mt-6 text-2xl font-black">Төлбөрийн арга</h2>

            <div className="mt-4 grid gap-4">
              <button
                type="button"
                onClick={() => setMethod("bank")}
                className={`rounded-2xl border px-5 py-5 text-left transition ${
                  method === "bank"
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 bg-zinc-950 hover:bg-zinc-800"
                }`}
              >
                <h3 className="text-lg font-bold">Дансаар шилжүүлэх</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Банкны данс руу шилжүүлээд гүйлгээний мэдээллээ бичнэ.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMethod("qpay")}
                className={`rounded-2xl border px-5 py-5 text-left transition ${
                  method === "qpay"
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 bg-zinc-950 hover:bg-zinc-800"
                }`}
              >
                <h3 className="text-lg font-bold">QPay</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  QPay төлбөрийн хэсэг удахгүй нэмэгдэнэ.
                </p>
              </button>
            </div>

            <Link
              href="/profile"
              className="mt-5 block text-center text-sm text-red-400 hover:text-red-300"
            >
              Profile руу буцах
            </Link>

            {!method && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5">
                <h2 className="text-xl font-bold">Төлбөрийн арга сонгоно уу</h2>
                <p className="mt-2 text-zinc-400">
                  Дансаар шилжүүлэх эсвэл QPay сонголтоос нэгийг дарна уу.
                </p>
              </div>
            )}

            {method === "bank" && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5">
                <h2 className="text-xl font-bold">Дансаар шилжүүлэх</h2>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                    <span className="text-zinc-400">Банк</span>
                    <span className="font-semibold">Хаан банк</span>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                    <span className="text-zinc-400">Дансны дугаар</span>
                    <span className="font-semibold">5779514888</span>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                    <span className="text-zinc-400">Хүлээн авагч</span>
                    <span className="font-semibold">М.Зангар</span>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                    <span className="text-zinc-400">Гүйлгээний утга</span>
                    <span className="font-semibold">Mangazet</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-400">Дүн</span>
                    <span className="font-bold text-red-400">
                      {formatPrice(selectedPlan.price)}
                    </span>
                  </div>
                </div>

                <label className="mt-5 block text-sm font-semibold text-zinc-300">
                  Гүйлгээний мэдээлэл, нэр, имэйл эсвэл тайлбар бичнэ үү
                </label>

                <textarea
                  value={transferInfo}
                  onChange={(e) => setTransferInfo(e.target.value)}
                  placeholder="Жишээ: bayar@gmail.com — 3 сарын premium эрх авах төлбөр шилжүүлсэн."
                  className="mt-3 h-36 w-full rounded-2xl border border-white/10 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
                />

                <button
                  type="button"
                  onClick={sendBankRequest}
                  disabled={sending}
                  className="mt-5 w-full rounded-xl bg-red-600 py-3 font-bold hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
                >
                  {sending ? "Илгээж байна..." : "Хүсэлт илгээх"}
                </button>

                <p className="mt-4 text-sm text-zinc-500">
                  Админ төлбөрийг шалгасны дараа premium эрхийг гараар
                  идэвхжүүлнэ.
                </p>
              </div>
            )}

            {method === "qpay" && (
              <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-zinc-950 p-5 text-center">
                <div className="rounded-full bg-red-500/10 px-5 py-3 text-red-300">
                  Coming soon
                </div>

                <h2 className="mt-5 text-3xl font-black">QPay удахгүй</h2>

                <p className="mt-3 text-zinc-400">
                  QPay төлбөрийн системийг дараа нь жинхэнэ байдлаар холбоно.
                  Одоогоор дансаар шилжүүлэх аргыг ашиглана уу.
                </p>

                <button
                  type="button"
                  onClick={() => setMethod("bank")}
                  className="mt-6 rounded-xl bg-zinc-800 px-5 py-3 font-semibold hover:bg-zinc-700"
                >
                  Дансаар шилжүүлэх рүү очих
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}