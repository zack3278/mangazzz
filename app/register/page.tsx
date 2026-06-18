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
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/50 backdrop-blur-xl md:grid-cols-2">
        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          <div className="mb-8">
            <Link href="/" className="mb-8 inline-flex items-center gap-3 md:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-xl font-black">
                U
              </div>
              <span className="text-xl font-black">MangaZet</span>
            </Link>

            <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
              Тавтай морил
            </p>

            <h1 className="mt-2 text-4xl font-black">Бүртгүүлэх</h1>
          </div>

          <label className="mb-2 block text-sm font-semibold text-zinc-300">
            Name
          </label>
          <input
            className="mb-5 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 outline-none focus:border-red-500"
            placeholder="Нэр"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="mb-2 block text-sm font-semibold text-zinc-300">
            Email
          </label>
          <input
            className="mb-5 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 outline-none focus:border-red-500"
            placeholder="Мейл хаяг"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="mb-2 block text-sm font-semibold text-zinc-300">
            Password
          </label>
          <input
            className="mb-6 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 outline-none focus:border-red-500"
            placeholder="Нууц үг"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full rounded-2xl bg-red-600 py-4 font-bold shadow-lg shadow-red-600/30 hover:bg-red-700">
            Бүртгүүлэх
          </button>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Бүртгэлтэй юу?{" "}
            <Link href="/login" className="font-semibold text-red-400 hover:text-red-300">
              Нэвтрэх
            </Link>
          </p>
        </form>

        <div className="hidden bg-gradient-to-br from-zinc-950 to-red-600 p-10 md:block">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl font-black text-red-600">
              U
            </div>

            <div>
              <h1 className="text-2xl font-black">MANGAZET</h1>
              <p className="text-sm text-red-100">MangaTeam</p>
            </div>
          </Link>

          <div className="mt-24">
            <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm">
              Манга/Манхва/Комик
            </p>

            <h2 className="text-5xl font-black leading-tight">
             ЗАР СУРТЧИЛГАА
            </h2>

            <p className="mt-5 leading-7 text-red-100">
              
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}