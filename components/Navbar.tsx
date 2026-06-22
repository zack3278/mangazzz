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

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
        const data = await res.json();
        setUser(res.ok && data.user ? data.user : null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  }

  const links = (
    <>
      <Link href="/" onClick={() => setOpen(false)}>Series</Link>
      <Link href="/premium" onClick={() => setOpen(false)}>Premium</Link>
      {!loading && user?.role === "ADMIN" && <Link href="/admin" onClick={() => setOpen(false)}>Admin</Link>}
      {!loading && (user?.role === "EDITOR" || user?.role === "ADMIN") && <Link href="/editor" onClick={() => setOpen(false)}>Editor</Link>}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080711]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-xl font-black text-black">M</span>
          <span><b className="block text-lg leading-none">MangaZet</b><small className="font-black tracking-[0.32em] text-violet-300">SCANS</small></span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-bold text-zinc-200 md:flex">{links}</nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? <span className="text-sm text-zinc-500">...</span> : user ? (
            <>
              <Link href="/profile" className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-black hover:bg-white/10">{user.name}</Link>
              <button onClick={logout} className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-black">Гарах</button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-black hover:bg-white/10">Нэвтрэх</Link>
              <Link href="/register" className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-black">Бүртгүүлэх</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen((v) => !v)} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl md:hidden" aria-label="Menu">
          {open ? "×" : "☰"}
        </button>
      </div>

      {open && (
        <div className="mx-4 mb-4 grid gap-2 rounded-3xl border border-white/10 bg-zinc-950 p-4 text-sm font-black md:hidden">
          {links}
          <div className="mt-2 grid gap-2 border-t border-white/10 pt-3">
            {loading ? null : user ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 px-4 py-3">{user.name}</Link>
                <button onClick={logout} className="rounded-2xl bg-white px-4 py-3 text-left text-black">Гарах</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 px-4 py-3">Нэвтрэх</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="rounded-2xl bg-white px-4 py-3 text-black">Бүртгүүлэх</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
