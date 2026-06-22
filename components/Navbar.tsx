"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function loadUser() {
      try {
        const savedUser =
          localStorage.getItem("user") ||
          localStorage.getItem("currentUser") ||
          localStorage.getItem("authUser");

        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            return;
          } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("currentUser");
            localStorage.removeItem("authUser");
          }
        }

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("jwt") ||
          localStorage.getItem("authToken");

        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();

        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else if (data?.id || data?.email) {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }

    loadUser();

    function handleStorageChange() {
      loadUser();
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleStorageChange);
    };
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("jwt");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authUser");

    document.cookie = "token=; Max-Age=0; path=/";
    document.cookie = "auth-token=; Max-Age=0; path=/";

    setUser(null);
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020202]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-3 px-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-700 text-xs font-bold shadow-[0_0_24px_rgba(220,38,38,0.55)]">
            M
          </span>
          <span className="hidden text-sm font-bold sm:block">MangaZet</span>
        </Link>

        <form
          action="/"
          className="ml-auto flex h-9 min-w-0 flex-1 max-w-[460px] items-center rounded-full border border-white/10 bg-[#0a0a0a] px-3"
        >
          <span className="mr-2 text-zinc-500">⌕</span>
          <input
            name="q"
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600"
          />
        </form>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            Нүүр
          </Link>

          <Link
            href="/premium"
            className="rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            Premium
          </Link>

          {mounted && user ? (
            <>
              <Link
                href="/profile"
                className="rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                Хэрэглэгч
              </Link>

              {(user.role === "ADMIN" || user.role === "EDITOR") && (
                <Link
                  href="/editor"
                  className="rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white"
                >
                  Эдитор
                </Link>
              )}

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white"
                >
                  Админ
                </Link>
              )}

              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-zinc-800 px-3 py-2 text-xs font-bold text-white hover:bg-red-600"
              >
                Гарах
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-600"
            >
              Нэвтрэх
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {mounted && user ? (
            <>
              <Link
                href="/profile"
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white"
              >
                Хэрэглэгч
              </Link>

              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white"
              >
                Гарах
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white"
            >
              Нэвтрэх
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}