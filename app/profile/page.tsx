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
  premiumUntil?: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });

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
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08050f] text-white">
        <Navbar />
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
            Loading...
          </div>
        </section>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#08050f] text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-purple-950 via-zinc-950 to-violet-950 p-8 shadow-2xl shadow-purple-950/30">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-5xl font-black text-white">
                {user.name.slice(0, 1).toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-black text-violet-300">
                  User profile
                </p>

                <h1 className="mt-2 text-5xl font-black tracking-tight">
                  {user.name}
                </h1>

                <p className="mt-2 text-zinc-400">{user.email}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 text-sm font-bold">
                    {user.role}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 text-sm font-bold text-zinc-300">
                    {user.isPremium ? "Premium user" : "Free user"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-3 font-black text-white transition hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-zinc-400">Role</p>
            <h2 className="mt-3 text-3xl font-black">{user.role}</h2>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-zinc-400">Premium</p>
            <h2 className="mt-3 text-3xl font-black">
              {user.isPremium ? "ACTIVE" : "INACTIVE"}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-zinc-400">Дуусах хугацаа</p>
            <h2 className="mt-3 text-3xl font-black">
              {user.premiumUntil
                ? new Date(user.premiumUntil).toLocaleDateString()
                : "—"}
            </h2>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-8">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-violet-300">
            Premium access
          </p>

          <h2 className="mt-4 text-3xl font-black">Premium эрх авах</h2>

          <p className="mt-4 max-w-2xl leading-7 text-zinc-300">
            Premium эрхтэй хэрэглэгч бүх manga/chapter унших боломжтой.
            Төлбөрөө шилжүүлээд admin шалгасны дараа эрх идэвхжинэ.
          </p>

          <Link
            href="/premium"
            className="mt-6 inline-flex rounded-2xl bg-violet-600 px-6 py-3 font-black text-white transition hover:bg-violet-500"
          >
            Premium авах
          </Link>
        </div>
      </section>
    </main>
  );
}