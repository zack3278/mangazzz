"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  description?: string;
  coverImage?: string;
  author?: string | null;
  genre?: string;
  genre2?: string | null;
  genre3?: string | null;
  chapters?: { id: number }[];
};

type Tab = "overview" | "users" | "premium" | "series";

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getPremiumStatus(user: User) {
  if (!user.isPremium || !user.premiumExpiresAt) return "FREE";

  const active = new Date(user.premiumExpiresAt).getTime() > Date.now();

  return active ? "ACTIVE" : "EXPIRED";
}

export default function AdminPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [comics, setComics] = useState<Comic[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users", {
        cache: "no-store",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Users ачаалахад алдаа гарлаа");
        return;
      }

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error(error);
      alert("Users ачаалахад алдаа гарлаа");
    }
  }

  async function loadComics() {
    try {
      const res = await fetch("/api/comics", {
        cache: "no-store",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Comics ачаалахад алдаа гарлаа");
        return;
      }

      if (Array.isArray(data)) {
        setComics(data);
      } else if (Array.isArray(data.comics)) {
        setComics(data.comics);
      } else {
        setComics([]);
      }
    } catch (error) {
      console.error(error);
      alert("Comics ачаалахад алдаа гарлаа");
    }
  }

  async function loadAll() {
    await Promise.all([loadUsers(), loadComics()]);
  }

  useEffect(() => {
    async function checkAuth() {
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

        if (data.user.role !== "ADMIN") {
          location.href = "/";
          return;
        }

        setCheckingAuth(false);
        await loadAll();
      } catch (error) {
        console.error(error);
        location.href = "/login";
      }
    }

    checkAuth();
  }, []);

  async function changeRole(userId: number, role: User["role"]) {
    try {
      setBusy(`role-${userId}`);
      setMessage("");

      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Role өөрчлөхөд алдаа гарлаа");
        return;
      }

      setMessage("Role амжилттай өөрчлөгдлөө.");
      await loadUsers();
    } catch (error) {
      console.error(error);
      alert("Role өөрчлөхөд алдаа гарлаа");
    } finally {
      setBusy("");
    }
  }

  async function changePremium(userId: number, months: 1 | 2 | 3 | 6 | 12) {
    try {
      setBusy(`premium-${userId}-${months}`);
      setMessage("");

      const res = await fetch(`/api/admin/users/${userId}/premium`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          isPremium: true,
          months,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Premium эрх өөрчлөхөд алдаа гарлаа");
        return;
      }

      setMessage(data.message || `${months} сарын premium эрх олголоо.`);
      await loadUsers();
    } catch (error) {
      console.error(error);
      alert("Premium эрх өөрчлөхөд алдаа гарлаа");
    } finally {
      setBusy("");
    }
  }

  async function cancelPremium(userId: number) {
    const ok = confirm("Энэ хэрэглэгчийн premium эрхийг цуцлах уу?");
    if (!ok) return;

    try {
      setBusy(`cancel-${userId}`);
      setMessage("");

      const res = await fetch(`/api/admin/users/${userId}/premium`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          isPremium: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Premium эрх цуцлахад алдаа гарлаа");
        return;
      }

      setMessage(data.message || "Premium эрхийг цуцаллаа.");
      await loadUsers();
    } catch (error) {
      console.error(error);
      alert("Premium эрх цуцлахад алдаа гарлаа");
    } finally {
      setBusy("");
    }
  }

  async function deleteComic(comicId: number) {
    const ok = confirm("Энэ series-ийг устгах уу? Доторх chapter хамт устна.");
    if (!ok) return;

    try {
      setBusy(`comic-${comicId}`);
      setMessage("");

      const res = await fetch(`/api/comics/${comicId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Series устгахад алдаа гарлаа");
        return;
      }

      setMessage("Series амжилттай устлаа.");
      await loadComics();
    } catch (error) {
      console.error(error);
      alert("Series устгахад алдаа гарлаа");
    } finally {
      setBusy("");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    location.href = "/login";
  }

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return users;

    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.role?.toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const premiumUsers = users.filter(
    (user) => getPremiumStatus(user) === "ACTIVE"
  );
  const editors = users.filter((user) => user.role === "EDITOR");
  const admins = users.filter((user) => user.role === "ADMIN");

  const totalChapters = useMemo(() => {
    return comics.reduce((sum, comic) => sum + (comic.chapters?.length || 0), 0);
  }, [comics]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "overview", label: "Dashboard", count: 0 },
    { key: "users", label: "Users", count: users.length },
    { key: "premium", label: "Premium", count: premiumUsers.length },
    { key: "series", label: "Series", count: comics.length },
  ];

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080807] text-white">
        <div className="rounded-3xl border border-white/10 bg-[#151410] px-8 py-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
            Mangazet Admin
          </p>
          <p className="mt-3 text-sm font-bold text-zinc-400">
            Шалгаж байна...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0a07] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.12),transparent_32%),linear-gradient(to_bottom,#0b0a07,#050505)]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] px-4 py-5">
        <header className="rounded-[28px] border border-white/10 bg-[#14130f] p-4 shadow-2xl shadow-black/35">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-xl font-black text-black">
                v1
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-yellow-300">
                  Mangazet
                </p>
                <h1 className="text-2xl font-black">Админ</h1>
              </div>
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Хэрэглэгч хайх..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-zinc-500 focus:border-yellow-400 sm:w-[260px]"
              />

              <Link
                href="/editor"
                className="rounded-2xl bg-yellow-400 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-300"
              >
                Эдитор
              </Link>

              <button
                onClick={logout}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08]"
              >
                Гарах
              </button>
            </div>
          </div>
        </header>

        {message && (
          <div className="mt-5 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-5 py-4 text-sm font-bold text-yellow-100">
            {message}
          </div>
        )}
        <section className="mt-5 rounded-[28px] border border-white/10 bg-[#14130f] shadow-2xl shadow-black/35">
          <div className="border-b border-white/10 p-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                    activeTab === tab.key
                      ? "bg-yellow-400 text-black"
                      : "bg-black/35 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {tab.label}

                  {tab.count > 0 && (
                    <span className="ml-2 rounded-full bg-black/15 px-2 py-0.5 text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-300">
                  Админ
                </p>
                <p className="mt-4 text-4xl font-black">{admins.length}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-500">
                  Админ эрхтэй хэрэглэгч
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-300">
                  Эдитор
                </p>
                <p className="mt-4 text-4xl font-black">{editors.length}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-500">
                  Манга нэмэх эрхтэй хэрэглэгч
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-300">
                  Premium
                </p>
                <p className="mt-4 text-4xl font-black">{premiumUsers.length}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-500">
                  Идэвхтэй premium хэрэглэгч
                </p>
              </div>
            </div>
          )}

          {(activeTab === "users" || activeTab === "premium") && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-black/25 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                    <th className="px-5 py-4">Хэрэглэгчид</th>
                    <th className="px-5 py-4">Үүрэг</th>
                    <th className="px-5 py-4">Premium</th>
                    <th className="px-5 py-4">Дуусах хугацаа</th>
                    <th className="px-5 py-4">Эрх өгөх</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm font-bold text-zinc-500"
                      >
                        Хэрэглэгч олдсонгүй.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const premiumStatus = getPremiumStatus(user);

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-white/10 hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4">
                            <p className="font-black">
                              {user.name || "No name"}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-zinc-500">
                              {user.email}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                  user.role === "ADMIN"
                                    ? "bg-yellow-400 text-black"
                                    : user.role === "EDITOR"
                                    ? "bg-orange-500/20 text-orange-300"
                                    : "bg-white/10 text-zinc-300"
                                }`}
                              >
                                {user.role}
                              </span>

                              <select
                                value={user.role}
                                onChange={(e) =>
                                  changeRole(
                                    user.id,
                                    e.target.value as User["role"]
                                  )
                                }
                                disabled={busy === `role-${user.id}`}
                                className="rounded-xl border border-white/10 bg-black/45 px-3 py-2 text-xs font-black text-white outline-none focus:border-yellow-400"
                              >
                                <option value="USER">Хэрэглэгч</option>
                                <option value="EDITOR">Эдитор</option>
                                <option value="ADMIN">Админ</option>
                              </select>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${
                                premiumStatus === "ACTIVE"
                                  ? "bg-yellow-400 text-black"
                                  : premiumStatus === "EXPIRED"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-white/10 text-zinc-400"
                              }`}
                            >
                              {premiumStatus}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm font-bold text-zinc-400">
                            {formatDate(user.premiumExpiresAt)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              {([1, 2, 3, 6, 12] as const).map((month) => (
                                <button
                                  key={month}
                                  onClick={() => changePremium(user.id, month)}
                                  disabled={
                                    busy === `premium-${user.id}-${month}`
                                  }
                                  className="rounded-xl bg-yellow-400 px-3 py-2 text-xs font-black text-black hover:bg-yellow-300 disabled:opacity-60"
                                >
                                  {busy === `premium-${user.id}-${month}`
                                    ? "..."
                                    : `${month} сар`}
                                </button>
                              ))}

                              <button
                                onClick={() => cancelPremium(user.id)}
                                disabled={busy === `cancel-${user.id}`}
                                className="rounded-xl bg-red-500/20 px-3 py-2 text-xs font-black text-red-300 hover:bg-red-500 hover:text-white disabled:opacity-60"
                              >
                                {busy === `cancel-${user.id}`
                                  ? "..."
                                  : "Цуцлах"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "series" && (
            <div className="p-5">
              {comics.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-center text-sm font-bold text-zinc-500">
                  Манга байхгүй байна.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {comics.map((comic) => (
                    <div
                      key={comic.id}
                      className="rounded-[24px] border border-white/10 bg-black/30 p-4"
                    >
                      <div className="flex gap-4">
                        <div className="h-24 w-16 shrink-0 overflow-hidden rounded-2xl bg-black">
                          {comic.coverImage ? (
                            <img
                              src={comic.coverImage}
                              alt={comic.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-yellow-400 text-xl font-black text-black">
                              M
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-lg font-black">
                            {comic.title}
                          </h3>

                          <p className="mt-1 text-xs font-bold text-zinc-500">
                            {comic.chapters?.length || 0} chapters
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {[comic.genre, comic.genre2, comic.genre3]
                              .filter(Boolean)
                              .map((genre) => (
                                <span
                                  key={genre}
                                  className="rounded-full bg-yellow-400/10 px-2.5 py-1 text-[10px] font-black text-yellow-300"
                                >
                                  {genre}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/manga/${comic.slug}`}
                          className="flex-1 rounded-2xl border border-white/10 bg-[#14130f] px-4 py-3 text-center text-xs font-black hover:bg-yellow-400 hover:text-black"
                        >
                          View
                        </Link>

                        <button
                          onClick={() => deleteComic(comic.id)}
                          disabled={busy === `comic-${comic.id}`}
                          className="rounded-2xl bg-red-500/20 px-4 py-3 text-xs font-black text-red-300 hover:bg-red-500 hover:text-white disabled:opacity-60"
                        >
                          {busy === `comic-${comic.id}` ? "..." : "Устгах"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}