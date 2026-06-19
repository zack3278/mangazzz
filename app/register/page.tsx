"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Register хийхэд алдаа гарлаа");
      return;
    }

    alert("Амжилттай бүртгэгдлээ. Одоо login хийнэ үү.");
    router.push("/login");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090511] px-4 py-8 text-white">
      <div className="absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-violet-700/30 blur-3xl" />
      <div className="absolute left-[-120px] bottom-[-120px] h-80 w-80 rounded-full bg-fuchsia-600/25 blur-3xl" />

      <section className="relative grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-2">
        <div className="p-6 sm:p-10">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-black">
              M
            </div>

            <div>
              <p className="text-lg font-black">MangaZet</p>
              <p className="text-xs text-violet-200/70">Create account</p>
            </div>
          </Link>

          <div className="mb-8">
            <p className="text-sm font-semibold text-violet-300">
              Шинэ хэрэглэгч
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Бүртгүүлэх
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Account үүсгээд manga, manhwa, comic унших платформоо ашиглаарай.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Name</label>
              <input
                required
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
                placeholder="Таны нэр"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
              Бүртгүүлэх
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Бүртгэлтэй юу?{" "}
            <Link
              href="/login"
              className="font-semibold text-violet-300 hover:text-violet-200"
            >
              Нэвтрэх
            </Link>
          </p>
        </div>

        <div className="hidden min-h-[620px] flex-col justify-between bg-gradient-to-br from-fuchsia-950 via-[#120a24] to-violet-950 p-10 lg:flex">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-violet-100">
              Mobile friendly UI
            </p>

            <h2 className="max-w-lg text-5xl font-black leading-tight">
              Өөрийн унших ертөнцөө эхлүүл.
            </h2>

            <p className="mt-5 max-w-md leading-7 text-zinc-300">
              Dark purple theme, premium badge, profile, reader, chapter list
              бүгд нэг өнгөний системтэй.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-6">
            <p className="text-sm text-zinc-300">Design concept</p>
            <p className="mt-2 text-2xl font-black">
              Glass card + Purple glow + Mobile UX
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}