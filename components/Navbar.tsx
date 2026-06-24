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
        }
      } catch {
        setUser(null);
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
    <header className="flex items-center justify-between gap-6 px-7 py-5">
      <Link href="/" className="flex items-center gap-2">
        <div className="leading-none">
          <div className="text-[10px] font-black tracking-[0.35em] text-yellow-400">
            MANGA
          </div>
          <div className="-mt-1 text-3xl font-black italic tracking-tight text-yellow-300">
            ZET
          </div>
        </div>

        <span className="rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black text-black">
          v1
        </span>
      </Link>

      <form action="/" className="hidden flex-1 md:block">
        <div className="relative max-w-[430px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            🔍
          </span>
          <input
            name="q"
            placeholder="search Manga"
            className="w-full rounded-lg border border-white/5 bg-zinc-900 px-11 py-3 text-sm font-semibold text-white outline-none transition focus:border-yellow-400/50"
          />
        </div>
      </form>

      <nav className="hidden items-center gap-8 text-sm font-black md:flex">
        <Link href="/" className="text-yellow-400">
          Нүүр
        </Link>
        <Link href="/" className="text-white hover:text-yellow-400">
          Манганууд
        </Link>
        <Link href="/premium" className="text-white hover:text-yellow-400">
          Premium
        </Link>

        {user?.role === "ADMIN" && (
          <Link href="/admin" className="text-white hover:text-yellow-400">
            Админ
          </Link>
        )}

        {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
          <Link href="/editor" className="text-white hover:text-yellow-400">
            Эдитор
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-3">
        <span className="hidden text-lg md:inline">🔔</span>

        {user ? (
          <>
            <Link
              href="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-black"
            >
              {user.name.slice(0, 1).toUpperCase()}
            </Link>

            <button
              onClick={logout}
              className="hidden rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white hover:bg-white/20 md:block"
            >
              Гарах
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-yellow-400 px-5 py-2.5 text-xs font-black text-black"
          >
            Нэвтрэх
          </Link>
        )}
      </div>
    </header>
  );
}