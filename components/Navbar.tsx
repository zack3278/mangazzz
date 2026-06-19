"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "EDITOR" | "ADMIN";
  isPremium: boolean;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090511]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-violet-900/30">
            M
          </div>

          <div>
            <p className="text-lg font-black tracking-wide text-white">
              MangaZet
            </p>
            <p className="text-xs text-zinc-400">Clean Purple Edition</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
          >
            Нүүр
          </Link>

          <Link
            href="/?genre=%D0%A0%D0%BE%D0%BC%D0%B0%D0%BD%D1%81"
            className="rounded-full px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
          >
            Romance
          </Link>

          <Link
            href="/?genre=%D0%A4%D0%B0%D0%BD%D1%82%D0%B0%D0%B7%D0%B8"
            className="rounded-full px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
          >
            Fantasy
          </Link>

          <Link
            href="/premium"
            className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 hover:scale-[1.02]"
          >
            Premium
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && user ? (
            <>
              {(user.role === "EDITOR" || user.role === "ADMIN") && (
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/editor"}
                  className="rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20"
                >
                  {user.role === "ADMIN" ? "Админ" : "Эдитор"}
                </Link>
              )}

              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                  {user.name?.slice(0, 1).toUpperCase()}
                </div>

                <div className="text-left leading-tight">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400">
                      {user.role}
                    </span>
                    {user.isPremium && (
                      <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-200">
                        PREMIUM
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <button
                onClick={logout}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                Гарах
              </button>
            </>
          ) : (
            !loading && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                >
                  Нэвтрэх
                </Link>

                <Link
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 hover:scale-[1.02]"
                >
                  Бүртгүүлэх
                </Link>
              </div>
            )
          )}
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 rounded-full bg-white" />
            <span className="block h-0.5 w-5 rounded-full bg-white" />
            <span className="block h-0.5 w-5 rounded-full bg-white" />
          </div>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0c0715]/95 px-4 py-4 md:hidden">
          <div className="space-y-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white"
            >
              Нүүр
            </Link>

            <Link
              href="/premium"
              onClick={() => setMobileOpen(false)}
              className="block rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white"
            >
              Premium
            </Link>

            {!loading && user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white"
                >
                  Profile
                </Link>

                {(user.role === "EDITOR" || user.role === "ADMIN") && (
                  <Link
                    href={user.role === "ADMIN" ? "/admin" : "/editor"}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-200"
                  >
                    {user.role === "ADMIN" ? "Админ" : "Эдитор"}
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white"
                >
                  Гарах
                </button>
              </>
            ) : (
              !loading && (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white"
                  >
                    Нэвтрэх
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-center text-sm font-semibold text-white"
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