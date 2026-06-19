"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Нэвтрэхэд алдаа гарлаа");
      return;
    }

    if (data.user.role === "ADMIN") {
      router.push("/admin");
      return;
    }

    if (data.user.role === "EDITOR") {
      router.push("/editor");
      return;
    }

    router.push("/");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090511] px-4 py-8 text-white">
      <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-violet-700/30 blur-3xl" />
      <div className="absolute right-[-120px] bottom-[-120px] h-80 w-80 rounded-full bg-fuchsia-600/25 blur-3xl" />

      <section className="relative grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-2">
        <div className="hidden min-h-[620px] flex-col justify-between bg-gradient-to-br from-violet-950 via-[#120a24] to-fuchsia-950 p-10 lg:flex">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-black">
              M
            </div>

            <div>
              <p className="text-xl font-black">MangaZet</p>
              <p className="text-sm text-violet-200/70">Dark Purple Reader</p>
            </div>
          </Link>

          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-violet-100">
              Манга • Манхва • Комик
            </p>

            <h1 className="max-w-lg text-5xl font-black leading-tight">
              Premium manga world-д тавтай морил.
            </h1>

            <p className="mt-5 max-w-md leading-7 text-zinc-300">
              Нэвтэрсний дараа profile, premium, унших эрх, chapter reading
              хэсгүүдийг ашиглах боломжтой.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-black">24/7</p>
              <p className="mt-1 text-xs text-zinc-300">Унших</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-black">VIP</p>
              <p className="mt-1 text-xs text-zinc-300">Premium</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-black">HD</p>
              <p className="mt-1 text-xs text-zinc-300">Зураг</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-black">
              M
            </div>

            <div>
              <p className="text-lg font-black">MangaZet</p>
              <p className="text-xs text-violet-200/70">Mobile Reader</p>
            </div>
          </Link>

          <div className="mb-8">
            <p className="text-sm font-semibold text-violet-300">
              Тавтай морил
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Нэвтрэх</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Email болон password ашиглан account руугаа орно.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Email</label>
              <input
                type="email"
                required
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Password
              </label>
              <input
                type="password"
                required
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-white shadow-lg shadow-violet-950/40 hover:scale-[1.01]">
              Нэвтрэх
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Бүртгэлгүй юу?{" "}
            <Link
              href="/register"
              className="font-semibold text-violet-300 hover:text-violet-200"
            >
              Бүртгүүлэх
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}