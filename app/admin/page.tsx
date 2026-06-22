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
  { months: 3, label: "3 сар", price: "13000₮" },
  { months: 6, label: "6 сар", price: "24000₮" },
  { months: 12, label: "1 жил", price: "44000₮" },
];

function premiumLabel(user: User) {
  if (!user.isPremium || !user.premiumExpiresAt) return "FREE";
  return new Date(user.premiumExpiresAt).getTime() > Date.now() ? "ACTIVE" : "EXPIRED";
}

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [comics, setComics] = useState<Comic[]>([]);

  async function loadUsers() {
    const res = await fetch("/api/admin/users", { credentials: "include" });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Users ачаалахад алдаа гарлаа");
    setUsers(Array.isArray(data) ? data : data.users || []);
  }

  async function loadComics() {
    const res = await fetch("/api/comics");
    const data = await res.json();
    setComics(Array.isArray(data) ? data : data.comics || []);
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.user) return (window.location.href = "/login");
        if (data.user.role !== "ADMIN") return (window.location.href = "/");
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
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Role өөрчлөхөд алдаа гарлаа");
    await loadUsers();
  }

  async function givePremium(userId: number, months: number) {
    const res = await fetch(`/api/admin/users/${userId}/premium`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPremium: true, months }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Premium эрх өөрчлөхөд алдаа гарлаа");
    await loadUsers();
  }

  async function cancelPremium(userId: number) {
    const ok = confirm("Premium эрхийг цуцлах уу?");
    if (!ok) return;
    const res = await fetch(`/api/admin/users/${userId}/premium`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPremium: false }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Premium цуцлахад алдаа гарлаа");
    await loadUsers();
  }

  async function deleteComic(comicId: number) {
    const ok = confirm("Энэ comic-ийг устгах уу? Доторх chapter хамт устна.");
    if (!ok) return;
    const res = await fetch(`/api/comics/${comicId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Comic устгахад алдаа гарлаа");
    await loadComics();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  }

  if (checking) return <main className="grid min-h-screen place-items-center bg-[#080711] text-white">Шалгаж байна...</main>;

  return (
    <main className="min-h-screen bg-[#080711] text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 rounded-[36px] border border-white/10 bg-gradient-to-br from-violet-500/20 via-white/[0.05] to-fuchsia-500/10 p-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-violet-200">Admin control</p>
            <h1 className="mt-2 text-5xl font-black">Dashboard</h1>
            <p className="mt-2 text-zinc-300">Users, premium, role, series management.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/editor" className="rounded-2xl bg-white px-5 py-3 font-black text-black">Editor studio</Link>
            <button onClick={logout} className="rounded-2xl border border-white/10 px-5 py-3 font-black hover:bg-white/10">Logout</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6"><p className="text-xs text-zinc-500">Users</p><b className="text-4xl">{users.length}</b></div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6"><p className="text-xs text-zinc-500">Comics</p><b className="text-4xl">{comics.length}</b></div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6"><p className="text-xs text-zinc-500">Premium</p><b className="text-4xl">{users.filter((u) => premiumLabel(u) === "ACTIVE").length}</b></div>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <h2 className="mb-4 text-2xl font-black">Хэрэглэгчид</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500"><tr><th className="p-3">User</th><th>Role</th><th>Premium</th><th>Expires</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="bg-black/25">
                    <td className="rounded-l-2xl p-3"><b>{user.name}</b><p className="text-zinc-500">{user.email}</p></td>
                    <td>
                      <select value={user.role} onChange={(e) => changeRole(user.id, e.target.value as User["role"])} className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2">
                        <option value="USER">USER</option><option value="EDITOR">EDITOR</option><option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">{premiumLabel(user)}</span></td>
                    <td>{user.premiumExpiresAt ? new Date(user.premiumExpiresAt).toLocaleDateString() : "—"}</td>
                    <td className="rounded-r-2xl p-3">
                      <div className="flex flex-wrap gap-2">
                        {premiumPlans.map((plan) => <button key={plan.months} onClick={() => givePremium(user.id, plan.months)} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-black">{plan.label}</button>)}
                        <button onClick={() => cancelPremium(user.id)} className="rounded-xl border border-red-400/30 px-3 py-2 text-xs font-black text-red-200">Цуцлах</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <h2 className="mb-4 text-2xl font-black">Series list</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {comics.map((comic) => (
              <div key={comic.id} className="flex gap-4 rounded-2xl border border-white/10 bg-black/25 p-3">
                <img src={comic.coverImage} alt={comic.title} className="h-24 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <Link href={`/comic/${comic.slug}`} className="font-black hover:text-violet-200">{comic.title}</Link>
                  <p className="mt-1 text-sm text-zinc-500">{comic.genre} • {comic.chapters?.length || 0} chapters</p>
                  <button onClick={() => deleteComic(comic.id)} className="mt-3 rounded-xl border border-red-400/30 px-3 py-2 text-xs font-black text-red-200">Устгах</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
