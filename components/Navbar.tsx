"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "EDITOR" | "ADMIN";
  isPremium: boolean;
};

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState(searchParams.get("q") || "");

  async function loadUser() {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  function search(e: FormEvent) {
    e.preventDefault();

    const value = q.trim();

    if (!value) {
      router.push("/");
      setMobileOpen(false);
      return;
    }

    router.push(`/?q=${encodeURIComponent(value)}`);
    setMobileOpen(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08030f]/85 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-violet-900/40">
            M
          </div>

          <div className="hidden sm:block">
            <p className="text-lg font-black tracking-wide text-white">
              MangaZet
            </p>
            <p className="text-xs text-zinc-400">Manga reader</p>
          </div>
        </Link>

        <form onSubmit={search} className="hidden flex-1 md:block">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Манга хайх..."
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-5 pr-24 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-violet-500"
            />

            <button className="absolute right-1.5 top-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-bold text-white">
              Хайх
            </button>
          </div>
        </form>

        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
          >
            Нүүр
          </Link>

          <Link
            href="/premium"
            className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-950/40"
          >
            Premium
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!loading && user ? (
            <>
              {(user.role === "EDITOR" || user.role === "ADMIN") && (
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/editor"}
                  className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 hover:bg-violet-500/20"
                >
                  {user.role === "ADMIN" ? "Админ" : "Эдитор"}
                </Link>
              )}

              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-black text-white">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>

                <div className="leading-tight">
                  <p className="max-w-24 truncate text-sm font-bold text-white">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-zinc-400">{user.role}</p>
                </div>
              </Link>

              <button
                onClick={logout}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Гарах
              </button>
            </>
          ) : (
            !loading && (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Нэвтрэх
                </Link>

                <Link
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-bold text-white"
                >
                  Бүртгүүлэх
                </Link>
              </>
            )
          )}
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white md:hidden"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 rounded-full bg-white" />
            <span className="block h-0.5 w-5 rounded-full bg-white" />
            <span className="block h-0.5 w-5 rounded-full bg-white" />
          </div>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#08030f]/95 px-4 py-4 md:hidden">
          <form onSubmit={search} className="mb-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Манга хайх..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-violet-500"
            />

            <button className="mt-2 h-12 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-bold text-white">
              Хайх
            </button>
          </form>

          <div className="space-y-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
            >
              Нүүр
            </Link>

            <Link
              href="/premium"
              onClick={() => setMobileOpen(false)}
              className="block rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-bold text-white"
            >
              Premium
            </Link>

            {!loading && user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                >
                  Profile
                </Link>

                {(user.role === "EDITOR" || user.role === "ADMIN") && (
                  <Link
                    href={user.role === "ADMIN" ? "/admin" : "/editor"}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-200"
                  >
                    {user.role === "ADMIN" ? "Админ самбар" : "Эдитор самбар"}
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                >
                  Гарах
                </button>
              </>
            ) : (
              !loading && (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Нэвтрэх
                  </Link>

                  <Link
                    href="/register"
                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Бүртгүүлэх
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}