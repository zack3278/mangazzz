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
};

function formatDate(date?: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
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
      <main className="site-shell flex min-h-screen items-center justify-center text-white">
        <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-lg font-black">
          Profile уншиж байна...
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="site-shell min-h-screen text-white">
      <Navbar />

      <section className="container-soft py-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#080808] shadow-2xl">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative grid gap-8 p-6 md:grid-cols-[1fr_360px] md:p-10">
            <div>
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-yellow-300 to-orange-500 text-5xl font-black text-black shadow-[0_20px_80px_rgba(250,204,21,0.22)]">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>

                <div>
                  <span
                    className={`rounded-md px-3 py-1 text-xs font-black text-black ${
                      user.isPremium ? "bg-yellow-400" : "bg-zinc-300"
                    }`}
                  >
                    {user.isPremium ? "PREMIUM MEMBER" : "FREE MEMBER"}
                  </span>

                  <h1 className="mt-4 text-4xl font-black md:text-6xl">
                    {user.name}
                  </h1>

                  <p className="mt-2 break-all text-sm font-bold text-zinc-400">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs font-bold text-zinc-500">Role</p>
                  <h2 className="mt-2 text-2xl font-black">{user.role}</h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs font-bold text-zinc-500">Premium</p>
                  <h2 className="mt-2 text-2xl font-black">
                    {user.isPremium ? "ACTIVE" : "LOCKED"}
                  </h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs font-bold text-zinc-500">Expires</p>
                  <h2 className="mt-2 text-lg font-black leading-7">
                    {formatDate(user.premiumExpiresAt)}
                  </h2>
                </div>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/10 bg-[#111] p-6">
              {user.isPremium ? (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 text-3xl">
                    👑
                  </div>

                  <h2 className="mt-5 text-3xl font-black">
                    Premium эрх идэвхтэй
                  </h2>

                  <p className="mt-3 text-sm font-medium leading-7 text-zinc-400">
                    Та бүх manga chapter-ийг унших боломжтой. Дуусах хугацаа:
                    <span className="ml-1 font-black text-yellow-300">
                      {formatDate(user.premiumExpiresAt)}
                    </span>
                  </p>

                  <Link href="/" className="primary-btn mt-6 w-full">
                    Manga унших
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-3xl">
                    🔒
                  </div>

                  <h2 className="mt-5 text-3xl font-black">
                    Premium хэрэгтэй
                  </h2>

                  <p className="mt-3 text-sm font-medium leading-7 text-zinc-400">
                    Premium эрх авснаар бүх chapter unlock болж шууд уншина.
                    QPay төлбөрөөр автоматаар идэвхжинэ.
                  </p>

                  <Link href="/premium" className="primary-btn mt-6 w-full">
                    Premium авах
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-[#111] p-5 transition hover:bg-[#181818]"
          >
            <p className="text-2xl">🏠</p>
            <h3 className="mt-3 font-black">Home</h3>
            <p className="mt-1 text-xs font-bold text-zinc-500">
              Manga жагсаалт руу буцах
            </p>
          </Link>

          <Link
            href="/premium"
            className="rounded-2xl border border-white/10 bg-[#111] p-5 transition hover:bg-[#181818]"
          >
            <p className="text-2xl">👑</p>
            <h3 className="mt-3 font-black">Premium</h3>
            <p className="mt-1 text-xs font-bold text-zinc-500">
              Эрх авах / сунгах
            </p>
          </Link>

          {(user.role === "EDITOR" || user.role === "ADMIN") && (
            <Link
              href="/editor"
              className="rounded-2xl border border-white/10 bg-[#111] p-5 transition hover:bg-[#181818]"
            >
              <p className="text-2xl">✍️</p>
              <h3 className="mt-3 font-black">Editor</h3>
              <p className="mt-1 text-xs font-bold text-zinc-500">
                Manga chapter нэмэх
              </p>
            </Link>
          )}

          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="rounded-2xl border border-white/10 bg-[#111] p-5 transition hover:bg-[#181818]"
            >
              <p className="text-2xl">🛠️</p>
              <h3 className="mt-3 font-black">Admin</h3>
              <p className="mt-1 text-xs font-bold text-zinc-500">
                Хэрэглэгч удирдах
              </p>
            </Link>
          )}
        </div>

        <button onClick={logout} className="danger-btn mt-6 px-6 py-3 text-sm">
          Logout
        </button>
      </section>
    </main>
  );
}