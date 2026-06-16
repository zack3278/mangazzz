"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";

type Order = {
  id: number;
  amount: number;
  status: string;
  invoiceId: string;
  qrText: string;
};

export default function PremiumPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function createOrder() {
    setLoading(true);

    try {
      const res = await fetch("/api/premium/create-order", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Order үүсгэхэд алдаа гарлаа");
        return;
      }

      setOrder(data.order);
    } finally {
      setLoading(false);
    }
  }

  async function confirmPayment() {
    if (!order) return;

    setConfirming(true);

    try {
      const res = await fetch("/api/premium/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Төлбөр шалгахад алдаа гарлаа");
        return;
      }

      alert(data.message || "Premium эрх идэвхжлээ");
      location.href = "/profile";
    } finally {
      setConfirming(false);
    }
  }

  return (
    <main className="min-h-screen text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-yellow-500/20 bg-zinc-950/80 p-8 shadow-2xl shadow-black/50">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-yellow-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_420px]">
            <div>
              <p className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300">
                👑 Premium эрх
              </p>

              <h1 className="mt-5 text-4xl font-black md:text-6xl">
                Premium ээ нээгээд хязгааргүйт унш.
              </h1>

              <p className="mt-5 max-w-2xl text-zinc-300 leading-7">
                Premium эрхтэй хэрэглэгч бүх мангаг унших боломжтой
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-3xl">📚</p>
                  <h3 className="mt-3 font-bold">Бүх зурагт ном</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Бүх бүлгийг хязгааргүй унших эрх.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-3xl">⚡</p>
                  <h3 className="mt-3 font-bold">Шуурхай төлбөр</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Төлсний дараа шууд premium эрх нээгдэнэ.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-3xl">👑</p>
                  <h3 className="mt-3 font-bold">Premium badge</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Profile дээр premium badge харагдана.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
                <p className="text-sm text-yellow-200">Үнэ</p>
                <h2 className="mt-2 text-4xl font-black">9,900₮</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Demo premium төлбөрийн хувилбар.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/40 p-6">
              <h2 className="text-2xl font-black">Төлбөр төлөх</h2>

              {!order ? (
                <>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Доорх товч дээр дарахад QPay төлбөрийн нэхэмжлэл
                    үүснэ.
                  </p>

                  <button
                    onClick={createOrder}
                    disabled={loading}
                    className="mt-6 w-full rounded-2xl bg-yellow-500 py-4 font-black text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                  >
                    {loading ? "Үүсгэж байна..." : "QPay төлбөр үүсгэх"}
                  </button>

                  <Link
                    href="/profile"
                    className="mt-3 block rounded-2xl border border-white/10 bg-white/5 py-4 text-center font-bold hover:bg-white/10"
                  >
                    Profile руу буцах
                  </Link>
                </>
              ) : (
                <div className="mt-5">
                  <div className="rounded-3xl bg-white p-5 text-black">
                    <div className="flex h-64 items-center justify-center rounded-2xl border-4 border-black text-center">
                      <div>
                        <p className="text-5xl">▦</p>
                        <p className="mt-3 font-black">QPay QR Demo</p>
                        <p className="mt-1 text-xs text-zinc-600">
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-zinc-400">Invoice</span>
                      <span className="text-right font-semibold">
                        {order.invoiceId}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-zinc-400">Дүн</span>
                      <span className="font-semibold">{order.amount}₮</span>
                    </div>

                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-zinc-400">Статус</span>
                      <span className="font-semibold text-yellow-300">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900 p-4">
                    <p className="text-xs leading-5 text-zinc-400 whitespace-pre-line">
                      {order.qrText}
                    </p>
                  </div>

                  <button
                    onClick={confirmPayment}
                    disabled={confirming}
                    className="mt-5 w-full rounded-2xl bg-red-600 py-4 font-black shadow-lg shadow-red-600/30 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:shadow-none"
                  >
                    {confirming
                      ? "Шалгаж байна..."
                      : "Шалгах"}
                  </button>

                  <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}