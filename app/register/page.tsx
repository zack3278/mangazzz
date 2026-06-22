"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Бүртгүүлэхэд алдаа гарлаа");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#080711] px-4 text-white">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.05] p-7 shadow-2xl shadow-black/50 backdrop-blur">
        <Link href="/" className="mb-8 inline-flex items-center gap-3 font-black"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-black">M</span>MangaZet</Link>
        <p className="text-xs font-black uppercase tracking-[0.35em] text-violet-300">Join library</p>
        <h1 className="mt-2 text-4xl font-black">Бүртгүүлэх</h1>
        <p className="mt-2 text-sm text-zinc-400">Series хадгалах, premium эрх авах хэрэглэгчийн бүртгэл.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-violet-400" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-violet-400" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 outline-none focus:border-violet-400" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button disabled={loading} className="w-full rounded-2xl bg-white py-4 font-black text-black disabled:opacity-60">{loading ? "Үүсгэж байна..." : "Бүртгүүлэх"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-400">Бүртгэлтэй юу? <Link className="font-bold text-violet-200" href="/login">Нэвтрэх</Link></p>
      </div>
    </main>
  );
}
