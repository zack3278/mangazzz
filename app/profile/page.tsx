"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "EDITOR" | "ADMIN";
  isPremium: boolean;
  premiumExpiresAt?: string | null;
  premiumUntil?: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.user) {
          window.location.href = "/login";
          return;
        }
        setUser(data.user);
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#080711] text-white">Loading...</main>;
  if (!user) return null;

  const premiumDate = user.premiumExpiresAt || user.premiumUntil;

  return (
    <main className="min-h-screen bg-[#080711] text-white">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="rounded-[36px] border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/40">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-20 w-20 place-items-center rounded-[28px] bg-gradient-to-br from-violet-400 to-fuchsia-400 text-4xl font-black text-black">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-300">Хэрэглэгчийн булан</p>
                <h1 className="mt-1 text-4xl font-black">{user.name}</h1>
                <p className="text-zinc-400">{user.email}</p>
              </div>
            </div>
            <button onClick={logout} className="rounded-2xl border border-white/10 px-5 py-3 font-black hover:bg-white/10">Гарах</button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5"><p className="text-xs text-zinc-500">Role</p><h2 className="mt-2 text-2xl font-black">{user.role}</h2></div>
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5"><p className="text-xs text-zinc-500">Premium</p><h2 className="mt-2 text-2xl font-black">{user.isPremium ? "ACTIVE" : "INACTIVE"}</h2></div>
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5"><p className="text-xs text-zinc-500">Дуусах хугацаа</p><h2 className="mt-2 text-2xl font-black">{premiumDate ? new Date(premiumDate).toLocaleDateString() : "—"}</h2></div>
          </div>

          <div className="mt-8 rounded-[28px] border border-violet-400/30 bg-violet-500/10 p-6">
            <h2 className="text-2xl font-black">Premium эрх авах</h2>
            <p className="mt-2 text-zinc-300">Premium эрх авсанаар бүх гаргалтуудыг хязгааргүй унших болоижтой</p>
            <Link href="/premium" className="mt-5 inline-block rounded-2xl bg-white px-5 py-3 font-black text-black">Premium авах</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
