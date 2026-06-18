"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";

type PaymentMethod = "bank" | "qpay" | null;

export default function PremiumPage() {
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [note, setNote] = useState("");

  function sendBankRequest() {
    if (!note.trim()) {
      alert("Гүйлгээний мэдээлэл эсвэл өөрийн имэйл/нэрээ бичнэ үү.");
      return;
    }

    alert(
      "Таны хүсэлт бүртгэгдлээ. Админ төлбөрийг шалгасны дараа premium эрхийг идэвхжүүлнэ."
    );

    setNote("");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40">
          <span className="rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            Premium эрх
          </span>

          <h1 className="mt-6 text-4xl font-black md:text-6xl">
            Premium эрх аваад хязгааргүй унш
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-zinc-300">
            Premium эрхтэй хэрэглэгч бүх манга, манхва, комикийн бүлгийг
            хязгааргүй унших боломжтой.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-zinc-900 p-5">
              <h3 className="text-xl font-bold">Бүх зурагт ном</h3>
              <p className="mt-2 text-zinc-400">
                Бүх бүлгийг хязгааргүй унших эрх.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-5">
              <h3 className="text-xl font-bold">Дансаар шилжүүлэх</h3>
              <p className="mt-2 text-zinc-400">
                Төлбөрөө шилжүүлээд мэдээллээ илгээнэ.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-5">
              <h3 className="text-xl font-bold">Premium badge</h3>
              <p className="mt-2 text-zinc-400">
                Profile дээр premium badge харагдана.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-400">
              Үнэ
            </p>

            <h2 className="mt-3 text-5xl font-black">9,900₮</h2>

            <p className="mt-4 text-zinc-400">
              Premium эрхийг идэвхжүүлэхийн тулд доорх төлбөрийн аргуудаас
              сонгоно уу.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <button
                onClick={() => setMethod("bank")}
                className={`rounded-2xl border px-5 py-5 text-left transition ${
                  method === "bank"
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 bg-zinc-900 hover:bg-zinc-800"
                }`}
              >
                <h3 className="text-xl font-bold">Дансаар шилжүүлэх</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Банкны данс руу шилжүүлээд гүйлгээний мэдээллээ бичнэ.
                </p>
              </button>

              <button
                onClick={() => setMethod("qpay")}
                className={`rounded-2xl border px-5 py-5 text-left transition ${
                  method === "qpay"
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 bg-zinc-900 hover:bg-zinc-800"
                }`}
              >
                <h3 className="text-xl font-bold">QPay</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  QPay төлбөрийн хэсэг удахгүй нэмэгдэнэ.
                </p>
              </button>
            </div>

            <div className="mt-8">
              <Link
                href="/profile"
                className="inline-flex rounded-xl bg-zinc-800 px-5 py-3 font-semibold hover:bg-zinc-700"
              >
                Profile руу буцах
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-8">
            {!method && (
              <div>
                <h2 className="text-2xl font-bold">Төлбөрийн арга сонгоно уу</h2>
                <p className="mt-3 text-zinc-400">
                  Дансаар шилжүүлэх эсвэл QPay сонголтоос нэгийг дарна уу.
                </p>
              </div>
            )}

            {method === "bank" && (
              <div>
                <h2 className="text-2xl font-bold">Дансаар шилжүүлэх</h2>

                <div className="mt-5 space-y-3 rounded-2xl bg-zinc-800 p-5">
                  <div>
                    <p className="text-sm text-zinc-400">Банк</p>
                    <p className="text-lg font-bold">Хаан банк</p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400">Дансны дугаар</p>
                    <p className="text-lg font-bold">Khanbank 5779514888</p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400">Хүлээн авагч М.Зангар</p>
                    <p className="text-lg font-bold">Mangazet</p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400">Дүн</p>
                    <p className="text-lg font-bold">5,000₮</p>
                  </div>
                </div>

                <label className="mt-6 block text-sm text-zinc-400">
                  Гүйлгээний утга, нэр, имэйл эсвэл тайлбар бичнэ үү
                </label>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Жишээ: bayar@gmail.com — Premium эрх авах төлбөр шилжүүлсэн."
                  className="mt-3 h-36 w-full rounded-2xl border border-white/10 bg-zinc-800 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
                />

                <button
                  onClick={sendBankRequest}
                  className="mt-5 w-full rounded-xl bg-red-600 py-3 font-bold hover:bg-red-700"
                >
                  Илгээх
                </button>

                <p className="mt-4 text-sm text-zinc-500">
                  Админ төлбөрийг шалгасны дараа premium эрхийг гараар
                  идэвхжүүлнэ.
                </p>
              </div>
            )}

            {method === "qpay" && (
              <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                <div className="rounded-full bg-red-500/10 px-5 py-3 text-red-300">
                  Coming soon
                </div>

                <h2 className="mt-5 text-3xl font-black">QPay удахгүй</h2>

                <p className="mt-3 text-zinc-400">
                  QPay төлбөрийн системийг дараа нь жинхэнэ байдлаар холбоно.
                  Одоогоор дансаар шилжүүлэх аргыг ашиглана уу.
                </p>

                <button
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