"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "EDITOR" | "ADMIN";
  isPremium: boolean;
  premiumUntil?: string | null;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
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

    loadUser();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070707]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-black text-black">
            M
          </div>

          <div className="leading-tight">
            <h1 className="text-xl font-black tracking-tight text-white">
              MangaZet
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500">
              SCANS
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="navbar-link">
            Home
          </Link>

          <Link href="/series" className="navbar-link">
            Series
          </Link>

          <Link href="/premium" className="navbar-link">
            Premium
          </Link>

          {!loading && user?.role === "ADMIN" && (
            <Link href="/admin" className="navbar-link">
              Admin
            </Link>
          )}

          {!loading && (user?.role === "EDITOR" || user?.role === "ADMIN") && (
            <Link href="/editor" className="navbar-link">
              Editor
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <>
              <Link
                href="/profile"
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm font-black text-white transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                {user.name}
              </Link>

              <button
                onClick={logout}
                className="rounded-full bg-white px-6 py-2 text-sm font-black text-black transition hover:bg-zinc-200"
              >
                Гарах
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-black text-zinc-300 transition hover:text-white"
              >
                Нэвтрэх
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-white px-5 py-2 text-sm font-black text-black transition hover:bg-zinc-200"
              >
                Бүртгүүлэх
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-2xl text-white md:hidden"
          aria-label="Open menu"
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#070707] px-4 py-4 md:hidden">
          <nav className="grid gap-2">
            <Link
              href="/"
              className="mobile-navbar-link"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>

            <Link
              href="/series"
              className="mobile-navbar-link"
              onClick={() => setOpen(false)}
            >
              Series
            </Link>

            <Link
              href="/premium"
              className="mobile-navbar-link"
              onClick={() => setOpen(false)}
            >
              Premium
            </Link>

            {!loading && user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="mobile-navbar-link"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            )}

            {!loading &&
              (user?.role === "EDITOR" || user?.role === "ADMIN") && (
                <Link
                  href="/editor"
                  className="mobile-navbar-link"
                  onClick={() => setOpen(false)}
                >
                  Editor
                </Link>
              )}
          </nav>

          <div className="mt-4 grid gap-2">
            {loading ? (
              <div className="h-12 animate-pulse rounded-xl bg-white/10" />
            ) : user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white"
                >
                  {user.name}
                </Link>

                <button
                  onClick={logout}
                  className="rounded-xl bg-white px-4 py-3 text-left text-sm font-black text-black"
                >
                  Гарах
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-black text-white"
                >
                  Нэвтрэх
                </Link>

                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-black text-black"
                >
                  Бүртгүүлэх
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}