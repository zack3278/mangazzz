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
  if (!date) return "Хугацаа байхгүй";

  return new Date(date).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

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
      <main className="min-h-screen bg-[#090511] text-white">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            Шалгаж байна...
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#090511] text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="absolute right-[-80px] top-[-80px] h-72 w-72 rounded-full bg-violet-700/25 blur-3xl" />
          <div className="absolute bottom-[-80px] left-[-80px] h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-4xl font-black shadow-lg shadow-violet-950/40">
                {user.name.slice(0, 1).toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-semibold text-violet-300">
                  User profile
                </p>
                <h1 className="mt-1 text-3xl font-black sm:text-5xl">
                  {user.name}
                </h1>
                <p className="mt-2 text-sm text-zinc-400">{user.email}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
                    {user.role}
                  </span>

                  {user.isPremium ? (
                    <span className="rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-200">
                      Premium active
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                      Free user
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-zinc-400">Role</p>
            <h2 className="mt-2 text-3xl font-black">{user.role}</h2>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-zinc-400">Premium</p>
            <h2 className="mt-2 text-3xl font-black">
              {user.isPremium ? "ACTIVE" : "INACTIVE"}
            </h2>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-zinc-400">Дуусах хугацаа</p>
            <h2 className="mt-2 text-xl font-black">
              {user.isPremium ? formatDate(user.premiumExpiresAt) : "—"}
            </h2>
          </div>
        </div>

        <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          {!user.isPremium ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
                Premium access
              </p>

              <h2 className="mt-3 text-3xl font-black">Premium эрх авах</h2>

              <p className="mt-3 max-w-2xl leading-7 text-zinc-300">
                Premium эрхтэй хэрэглэгч бүх manga/chapter унших боломжтой.
                Төлбөрөө шилжүүлээд админ шалгасны дараа эрх идэвхжинэ.
              </p>

              <Link
                href="/premium"
                className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/40"
              >
                Premium авах
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
                Premium benefit
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Та premium эрхтэй байна
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-zinc-300">
                Бүх manga/chapter унших эрх идэвхтэй байна. Унших хэсэг рүү
                орж үргэлжлүүлээрэй.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/40"
              >
                Уншиж эхлэх
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
          >
            Home
          </Link>

          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-center text-sm font-semibold text-violet-200 hover:bg-violet-500/20"
            >
              Admin panel
            </Link>
          )}

          {(user.role === "EDITOR" || user.role === "ADMIN") && (
            <Link
              href="/editor"
              className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-center text-sm font-semibold text-violet-200 hover:bg-violet-500/20"
            >
              Editor panel
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}