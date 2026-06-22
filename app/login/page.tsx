"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Нэвтрэхэд алдаа гарлаа");
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#080711] px-4 text-white">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.05] p-7 shadow-2xl shadow-black/50 backdrop-blur">
        <Link href="/" className="mb-8 inline-flex items-center gap-3 font-black"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-black">M</span>MangaZet</Link>
        <p className="text-xs font-black uppercase tracking-[0.35em] text-violet-300">Тавтай морил</p>
        <h1 className="mt-2 text-4xl font-black">Нэвтрэх</h1>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-violet-400" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-violet-400" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button disabled={loading} className="w-full rounded-2xl bg-white py-4 font-black text-black disabled:opacity-60">{loading ? "Нэвтэрч байна..." : "Нэвтрэх"}</button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">Бүртгэлгүй юу? <Link className="font-bold text-violet-200" href="/register">Бүртгүүлэх</Link></p>
      </div>
    </main>
  );
}
