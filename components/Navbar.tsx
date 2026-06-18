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
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 text-white">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 text-xl font-black shadow-lg shadow-red-600/30">
            U
          </div>

          <div>
            <h1 className="text-xl font-black leading-none">MangaZet</h1>
            <p className="text-xs text-zinc-400">Comic Reader</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            Home
          </Link>

          {!loading && user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="rounded-full bg-red-600/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-600/30"
            >
              Admin
            </Link>
          )}

          {!loading && (user?.role === "EDITOR" || user?.role === "ADMIN") && (
            <Link
              href="/editor"
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/20"
            >
              Editor
            </Link>
          )}

          {!loading && user ? (
            <>
              {user.isPremium ? (
                <Link
                  href="/profile"
                  className="hidden rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-300 hover:bg-yellow-500/20 md:block"
                >
                  👑 Premium
                </Link>
              ) : (
                <Link
                  href="/premium"
                  className="hidden rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-300 hover:bg-yellow-500/20 md:block"
                >
                  👑 Premium авах
                </Link>
              )}

              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-4 hover:bg-white/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm font-black">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>

                <div className="hidden text-left md:block">
                  <p className="max-w-28 truncate text-sm font-bold">
                    {user.name}
                  </p>
                  <p className="text-xs text-zinc-500">{user.role}</p>
                </div>
              </Link>

              <button
                onClick={logout}
                className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/30 hover:bg-red-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}