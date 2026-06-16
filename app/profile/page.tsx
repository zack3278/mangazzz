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
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        location.href = "/login";
        return;
      }

      setUser(data.user);
    } catch {
      location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    location.href = "/login";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4">
          Шалгаж байна...
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 p-8 shadow-2xl shadow-black/50">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-red-600 text-4xl font-black shadow-lg shadow-red-600/30">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
                    User profile
                  </p>

                  <h1 className="mt-2 text-4xl font-black">{user.name}</h1>

                  <p className="mt-2 text-zinc-400">{user.email}</p>
                </div>
              </div>

              <div>
                {user.isPremium ? (
                  <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-4 text-center">
                    <p className="text-3xl">👑</p>
                    <p className="mt-2 font-black text-yellow-300">
                      Premium active
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-center">
                    <p className="text-3xl">🔒</p>
                    <p className="mt-2 font-black text-zinc-300">
                      Premium байхгүй
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-zinc-400">Role</p>
                <h2 className="mt-2 text-2xl font-black">{user.role}</h2>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-zinc-400">Premium</p>
                <h2
                  className={`mt-2 text-2xl font-black ${
                    user.isPremium ? "text-yellow-300" : "text-zinc-300"
                  }`}
                >
                  {user.isPremium ? "ACTIVE" : "INACTIVE"}
                </h2>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-zinc-400">Access</p>
                <h2 className="mt-2 text-2xl font-black">
                  {user.isPremium ? "Read manga" : "Locked"}
                </h2>
              </div>
            </div>

            {!user.isPremium && (
              <div className="mt-8 rounded-[2rem] border border-yellow-500/20 bg-yellow-500/10 p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-yellow-300">
                      👑 Premium эрх авах
                    </h2>

                    <p className="mt-2 max-w-2xl leading-7 text-zinc-300">
                      Premium эрхтэй хэрэглэгч бүх manga/chapter унших
                      боломжтой. QPay төлбөрийн demo page рүү орж premium эрхээ
                      идэвхжүүлнэ.
                    </p>
                  </div>

                  <Link
                    href="/premium"
                    className="rounded-2xl bg-yellow-500 px-6 py-4 text-center font-black text-black hover:bg-yellow-400"
                  >
                    Premium авах
                  </Link>
                </div>
              </div>
            )}

            {user.isPremium && (
              <div className="mt-8 rounded-[2rem] border border-yellow-500/20 bg-yellow-500/10 p-6">
                <h2 className="text-2xl font-black text-yellow-300">
                  👑 Premium benefit
                </h2>

                <p className="mt-2 leading-7 text-zinc-300">
                  Та premium эрхтэй тул бүх manga/chapter унших боломжтой.
                </p>

                <Link
                  href="/"
                  className="mt-5 inline-block rounded-2xl bg-red-600 px-6 py-4 font-bold shadow-lg shadow-red-600/30 hover:bg-red-700"
                >
                  Уншиж эхлэх
                </Link>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-bold hover:bg-white/10"
              >
                Home
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-2xl bg-red-600 px-6 py-3 font-bold hover:bg-red-700"
                >
                  Admin panel
                </Link>
              )}

              {(user.role === "EDITOR" || user.role === "ADMIN") && (
                <Link
                  href="/editor"
                  className="rounded-2xl bg-white/10 px-6 py-3 font-bold hover:bg-white/20"
                >
                  Editor panel
                </Link>
              )}

              <button
                onClick={logout}
                className="rounded-2xl bg-zinc-800 px-6 py-3 font-bold hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}