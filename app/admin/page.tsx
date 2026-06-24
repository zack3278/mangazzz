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
  premiumExpiresAt: string | null;
  createdAt: string;
};

type Comic = {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  genre: string;
  genre2: string | null;
  genre3: string | null;
  chapters: { id: number; title: string; number: number }[];
};

const premiumPlans = [
  { months: 1, label: "1 сар", price: "5000₮" },
  { months: 2, label: "2 сар", price: "9000₮" },
  { months: 3, label: "3 сар", price: "13000₮" },
  { months: 6, label: "6 сар", price: "22000₮" },
  { months: 12, label: "12 сар", price: "35000₮" },
];

function premiumLabel(user: User) {
  if (!user.isPremium || !user.premiumExpiresAt) return "FREE";

  return new Date(user.premiumExpiresAt).getTime() > Date.now()
    ? "ACTIVE"
    : "EXPIRED";
}

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [comics, setComics] = useState<Comic[]>([]);

  async function loadUsers() {
    const res = await fetch("/api/admin/users", {
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Users ачаалахад алдаа гарлаа");
      return;
    }

    setUsers(Array.isArray(data) ? data : data.users || []);
  }

  async function loadComics() {
    const res = await fetch("/api/comics", {
      cache: "no-store",
    });

    const data = await res.json();

    setComics(Array.isArray(data) ? data : data.comics || []);
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.user) {
          window.location.href = "/login";
          return;
        }

        if (data.user.role !== "ADMIN") {
          window.location.href = "/";
          return;
        }

        await Promise.all([loadUsers(), loadComics()]);
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, []);

  async function changeRole(userId: number, role: User["role"]) {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Role өөрчлөхөд алдаа гарлаа");
      return;
    }

    await loadUsers();
  }

  async function givePremium(userId: number, months: number) {
    const res = await fetch(`/api/admin/users/${userId}/premium`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isPremium: true, months }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Premium эрх өөрчлөхөд алдаа гарлаа");
      return;
    }

    await loadUsers();
  }

  async function cancelPremium(userId: number) {
    const ok = confirm("Premium эрхийг цуцлах уу?");

    if (!ok) return;

    const res = await fetch(`/api/admin/users/${userId}/premium`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isPremium: false }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Premium цуцлахад алдаа гарлаа");
      return;
    }

    await loadUsers();
  }

  async function deleteComic(comicId: number) {
    const ok = confirm("Энэ comic-ийг устгах уу? Доторх chapter хамт устна.");

    if (!ok) return;

    const res = await fetch(`/api/comics/${comicId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Comic устгахад алдаа гарлаа");
      return;
    }

    await loadComics();
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/login";
  }

  if (checking) {
    return (
      <main className="site-shell flex min-h-screen items-center justify-center text-white">
        <div className="glass-card rounded-3xl p-8 text-lg font-black">
          Шалгаж байна...
        </div>
      </main>
    );
  }

  return (
    <main className="site-shell min-h-screen text-white">
      <Navbar />

      <section className="container-soft py-10">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <span className="badge badge-red">Admin control</span>

              <h1 className="mt-4 text-4xl font-black">Dashboard</h1>

              <p className="mt-2 text-zinc-400">
                Users, premium, role, series management.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/editor" className="primary-btn">
                Editor studio
              </Link>

              <button onClick={logout} className="secondary-btn">
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="glass-card rounded-3xl p-6">
            <p className="text-sm font-bold text-zinc-500">Users</p>
            <h2 className="mt-2 text-4xl font-black">{users.length}</h2>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <p className="text-sm font-bold text-zinc-500">Comics</p>
            <h2 className="mt-2 text-4xl font-black">{comics.length}</h2>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <p className="text-sm font-bold text-zinc-500">Premium</p>
            <h2 className="mt-2 text-4xl font-black">
              {users.filter((u) => premiumLabel(u) === "ACTIVE").length}
            </h2>
          </div>
        </div>

        <section className="mt-8 glass-panel overflow-hidden rounded-[2rem]">
          <div className="border-b border-white/10 p-6">
            <h2 className="text-2xl font-black">Хэрэглэгчид</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Premium</th>
                  <th className="px-5 py-4">Expires</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-white/10">
                    <td className="px-5 py-4">
                      <p className="font-black text-white">{user.name}</p>
                      <p className="mt-1 text-xs font-bold text-zinc-500">
                        {user.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          changeRole(user.id, e.target.value as User["role"])
                        }
                        className="soft-input py-2"
                      >
                        <option value="USER">USER</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`badge ${
                          premiumLabel(user) === "ACTIVE"
                            ? "badge-green"
                            : premiumLabel(user) === "EXPIRED"
                            ? "badge-red"
                            : ""
                        }`}
                      >
                        {premiumLabel(user)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-zinc-400">
                      {user.premiumExpiresAt
                        ? new Date(user.premiumExpiresAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {premiumPlans.map((plan) => (
                          <button
                            key={plan.months}
                            onClick={() => givePremium(user.id, plan.months)}
                            className="secondary-btn px-3 py-2 text-xs"
                          >
                            {plan.label}
                          </button>
                        ))}

                        <button
                          onClick={() => cancelPremium(user.id)}
                          className="danger-btn"
                        >
                          Цуцлах
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-5 text-2xl font-black">Series list</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comics.map((comic) => (
              <div key={comic.id} className="glass-card rounded-3xl p-5">
                <h3 className="line-clamp-1 text-xl font-black">
                  {comic.title}
                </h3>

                <p className="mt-2 text-sm font-bold text-zinc-500">
                  {comic.genre} • {comic.chapters?.length || 0} chapters
                </p>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/comic/${comic.slug}`}
                    className="secondary-btn px-3 py-2 text-xs"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => deleteComic(comic.id)}
                    className="danger-btn"
                  >
                    Устгах
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}