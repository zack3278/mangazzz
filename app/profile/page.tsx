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

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
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
      credentials: "include",
    });

    location.href = "/login";
  }

  function formatPremiumDate(date?: string | null) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="site-shell flex min-h-screen items-center justify-center text-white">
        <div className="glass-card rounded-3xl p-8 text-lg font-black">
          Шалгаж байна...
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="site-shell min-h-screen text-white">
      <Navbar />

      <section className="container-soft py-10">
        <div className="glass-panel overflow-hidden rounded-[2rem] p-6 md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-red-500 via-orange-500 to-purple-500 text-4xl font-black shadow-[0_20px_60px_rgba(239,68,68,0.25)]">
                {user.name.slice(0, 1).toUpperCase()}
              </div>

              <div>
                <span className="badge badge-red">User profile</span>

                <h1 className="mt-3 text-4xl font-black">{user.name}</h1>

                <p className="mt-1 font-bold text-zinc-400">{user.email}</p>
              </div>
            </div>

            {user.isPremium ? (
              <span className="badge badge-gold text-base">
                Premium active
              </span>
            ) : (
              <span className="badge text-base">Premium байхгүй</span>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="glass-card rounded-3xl p-6">
            <p className="text-sm font-bold text-zinc-500">Role</p>
            <h2 className="mt-2 text-3xl font-black">{user.role}</h2>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <p className="text-sm font-bold text-zinc-500">Premium</p>
            <h2 className="mt-2 text-3xl font-black">
              {user.isPremium ? "ACTIVE" : "INACTIVE"}
            </h2>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <p className="text-sm font-bold text-zinc-500">Access</p>
            <h2 className="mt-2 text-3xl font-black">
              {user.isPremium ? "Unlocked" : "Locked"}
            </h2>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <p className="text-sm font-bold text-zinc-500">Дуусах хугацаа</p>
            <h2 className="mt-2 text-lg font-black leading-7">
              {formatPremiumDate(user.premiumExpiresAt)}
            </h2>
          </div>
        </div>

        <div className="mt-6 glass-panel rounded-[2rem] p-6 md:p-8">
          {!user.isPremium ? (
            <>
              <span className="badge badge-gold">Premium required</span>

              <h2 className="mt-4 text-3xl font-black">Premium эрх авах</h2>

              <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
                Premium эрхтэй хэрэглэгч бүх manga/chapter унших боломжтой.
                QPay төлбөрөөр эрхээ автоматаар идэвхжүүлнэ.
              </p>

              <Link href="/premium" className="primary-btn mt-6">
                Premium авах
              </Link>
            </>
          ) : (
            <>
              <span className="badge badge-green">Unlocked</span>

              <h2 className="mt-4 text-3xl font-black">Premium идэвхтэй</h2>

              <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
                Та premium эрхтэй тул бүх manga/chapter унших боломжтой.
                Premium эрх дуусах хугацаа:{" "}
                <span className="font-black text-amber-200">
                  {formatPremiumDate(user.premiumExpiresAt)}
                </span>
              </p>

              <Link href="/" className="primary-btn mt-6">
                Уншиж эхлэх
              </Link>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="secondary-btn">
            Home
          </Link>

          {user.role === "ADMIN" && (
            <Link href="/admin" className="secondary-btn">
              Admin panel
            </Link>
          )}

          {(user.role === "EDITOR" || user.role === "ADMIN") && (
            <Link href="/editor" className="secondary-btn">
              Editor panel
            </Link>
          )}

          <button onClick={logout} className="danger-btn px-5 py-3 text-sm">
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}