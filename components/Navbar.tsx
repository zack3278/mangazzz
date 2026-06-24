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
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    loadUser();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/45 backdrop-blur-2xl">
      <div className="container-soft flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-purple-500 text-lg font-black text-white shadow-[0_16px_40px_rgba(239,68,68,0.3)]">
            M
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight text-white">
              Mangazet
            </h1>
            <p className="-mt-1 text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
              Manga Reader
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/" className="navbar-link">
            Home
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
          {!loading && user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 transition hover:bg-white/10"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>

                <span className="leading-tight">
                  <span className="block text-sm font-black text-white">
                    {user.name}
                  </span>
                  <span className="block text-[11px] font-bold uppercase text-zinc-500">
                    {user.isPremium ? "Premium" : user.role}
                  </span>
                </span>
              </Link>

              <button onClick={logout} className="secondary-btn px-4 py-3 text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="secondary-btn px-4 py-3 text-sm">
                Login
              </Link>
              <Link href="/register" className="primary-btn px-4 py-3 text-sm">
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl font-black text-white md:hidden"
          aria-label="Open menu"
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open && (
        <div className="container-soft pb-5 md:hidden">
          <div className="glass-panel grid gap-2 rounded-3xl p-3">
            <Link href="/" className="mobile-navbar-link">
              Home
            </Link>
            <Link href="/premium" className="mobile-navbar-link">
              Premium
            </Link>

            {!loading && user?.role === "ADMIN" && (
              <Link href="/admin" className="mobile-navbar-link">
                Admin
              </Link>
            )}

            {!loading && (user?.role === "EDITOR" || user?.role === "ADMIN") && (
              <Link href="/editor" className="mobile-navbar-link">
                Editor
              </Link>
            )}

            {!loading && user ? (
              <>
                <Link href="/profile" className="mobile-navbar-link">
                  Profile — {user.name}
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="mobile-navbar-link text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="mobile-navbar-link">
                  Login
                </Link>
                <Link href="/register" className="mobile-navbar-link">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}