"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NavUser = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "EDITOR" | "ADMIN";
  isPremium?: boolean;
  profileImage?: string | null;
  avatarPreset?: string | null;
};

function getAvatarUrl(user: NavUser | null) {
  if (!user) return "";

  if (user.profileImage) {
    return user.profileImage;
  }

  if (user.avatarPreset === "girl") {
    return "/avatars/girl.png";
  }

  if (user.avatarPreset === "boy") {
    return "/avatars/boy.png";
  }

  return "";
}

function getInitial(user: NavUser | null) {
  if (!user) return "U";
  return (user.name || user.email || "U").charAt(0).toUpperCase();
}

export default function Navbar() {
  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const avatarUrl = useMemo(() => getAvatarUrl(user), [user]);

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
      } catch (error) {
        console.error("Navbar user error:", error);
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
    <header className="relative z-50">
      <nav className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="leading-none">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-yellow-300">
              Manga
            </p>
            <p className="text-3xl font-black leading-none text-yellow-400">
              ZET
              <span className="ml-1 rounded-md bg-emerald-400 px-1.5 py-0.5 align-middle text-[10px] font-black text-black">
                v1
              </span>
            </p>
          </div>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          <div className="w-full max-w-[430px]">
            <div className="flex items-center rounded-xl border border-white/10 bg-[#15151a] px-4 py-3">
              <span className="mr-2 text-sm">🔍</span>
              <input
                placeholder="search Manga"
                className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-500"
              />
            </div>
          </div>

          <Link href="/" className="text-sm font-black text-white hover:text-yellow-300">
            Нүүр
          </Link>

          <Link
            href="/manga"
            className="text-sm font-black text-white hover:text-yellow-300"
          >
            Манганууд
          </Link>

          <Link
            href="/premium"
            className="text-sm font-black text-white hover:text-yellow-300"
          >
            Premium
          </Link>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm font-black text-white hover:text-yellow-300"
            >
              Админ
            </Link>
          )}

          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
            <Link
              href="/editor"
              className="text-sm font-black text-white hover:text-yellow-300"
            >
              Эдитор
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {loading ? (
            <div className="h-11 w-11 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <>
              <span className="text-lg">🔔</span>

              <Link
                href="/profile"
                className="group relative h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-[#19191f]"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name || "Profile"}
                    className="h-full w-full object-cover transition group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-yellow-400 text-lg font-black text-black">
                    {getInitial(user)}
                  </div>
                )}
              </Link>

              <button
                onClick={logout}
                className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-black text-white hover:bg-yellow-400 hover:text-black"
              >
                Гарах
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-black text-black hover:bg-yellow-300"
            >
              Нэвтрэх
            </Link>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl font-black lg:hidden"
        >
          ☰
        </button>
      </nav>

      {mobileOpen && (
        <div className="mt-3 rounded-[24px] border border-white/10 bg-[#111115] p-4 shadow-2xl lg:hidden">
          <div className="mb-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
            <input
              placeholder="search Manga"
              className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-xl px-4 py-3 text-sm font-black hover:bg-white/5"
            >
              Нүүр
            </Link>

            <Link
              href="/manga"
              className="rounded-xl px-4 py-3 text-sm font-black hover:bg-white/5"
            >
              Манганууд
            </Link>

            <Link
              href="/premium"
              className="rounded-xl px-4 py-3 text-sm font-black hover:bg-white/5"
            >
              Premium
            </Link>

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="rounded-xl px-4 py-3 text-sm font-black hover:bg-white/5"
              >
                Админ
              </Link>
            )}

            {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
              <Link
                href="/editor"
                className="rounded-xl px-4 py-3 text-sm font-black hover:bg-white/5"
              >
                Эдитор
              </Link>
            )}

            {user ? (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3">
                <Link
                  href="/profile"
                  className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-[#19191f]"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.name || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-yellow-400 text-lg font-black text-black">
                      {getInitial(user)}
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">
                    {user.name || "User"}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{user.email}</p>
                </div>

                <button
                  onClick={logout}
                  className="rounded-xl bg-red-500/20 px-3 py-2 text-xs font-black text-red-300"
                >
                  Гарах
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="mt-3 rounded-xl bg-yellow-400 px-4 py-3 text-center text-sm font-black text-black"
              >
                Нэвтрэх
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}