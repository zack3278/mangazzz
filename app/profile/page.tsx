"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type Comic = {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  status: string;
  chapters: { id: number }[];
};

type User = {
  id: number;
  name: string;
  email: string;
  isPremium: boolean;
  premiumExpiresAt?: string | null;
  profileImage?: string | null;
  avatarPreset: string;
  xp: number;
  level: number;
  nextLevelXp: number;
  currentLevelStartXp: number;
  progressPercent: number;
  nextReward: string;
  favoriteMangas: Comic[];
};

type UploadResult = {
  message: string;
  url: string;
  key: string;
};

function formatDate(date?: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function imageSrc(src?: string | null) {
  if (!src) return "/placeholder-cover.jpg";

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/")
  ) {
    return src;
  }

  return `/${src}`;
}

function DefaultAvatar({ preset, size = "large" }: { preset: string; size?: "large" | "small" }) {
  const isGirl = preset === "girl";
  const box = size === "large" ? "h-32 w-32 text-5xl" : "h-16 w-16 text-2xl";

  return (
    <div
      className={`${box} relative flex shrink-0 items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br ${
        isGirl
          ? "from-pink-300 via-fuchsia-400 to-purple-700"
          : "from-yellow-300 via-orange-400 to-red-600"
      } text-black shadow-[0_20px_80px_rgba(250,204,21,0.18)]`}
    >
      <div className="absolute left-3 top-3 rounded-md bg-black px-2 py-1 text-[10px] font-black text-yellow-300">
        MZ
      </div>
      <span>{isGirl ? "👧" : "👦"}</span>
    </div>
  );
}

function AvatarView({ user }: { user: User }) {
  if (user.profileImage) {
    return (
      <img
        src={imageSrc(user.profileImage)}
        alt={user.name}
        className="h-32 w-32 rounded-[2rem] object-cover shadow-[0_20px_80px_rgba(250,204,21,0.16)]"
      />
    );
  }

  return <DefaultAvatar preset={user.avatarPreset || "boy"} />;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile", {
        cache: "no-store",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        window.location.href = "/login";
        return;
      }

      setUser(data.user);
    } catch {
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function updateProfile(body: { profileImage?: string | null; avatarPreset?: string }) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Profile шинэчлэхэд алдаа гарлаа");
      return;
    }

    await loadProfile();
  }

  async function uploadProfileImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "profile-images");

      const res = await fetch("/api/upload/r2", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as UploadResult;

      if (!res.ok) {
        alert(data.message || "Зураг upload хийхэд алдаа гарлаа");
        return;
      }

      await updateProfile({
        profileImage: data.url,
      });
    } catch {
      alert("Зураг upload хийхэд алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  }

  async function toggleFavorite(comicId: number) {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        comicId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Favorite өөрчлөхөд алдаа гарлаа");
      return;
    }

    await loadProfile();
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="site-shell flex min-h-screen items-center justify-center text-white">
        <div className="rounded-3xl border border-white/10 bg-[#111] p-8 text-lg font-black">
          Profile уншиж байна...
        </div>
      </main>
    );
  }

  if (!user) return null;

  const xpCurrent = user.xp - user.currentLevelStartXp;
  const xpNeed = user.nextLevelXp - user.currentLevelStartXp;

  return (
    <main className="site-shell min-h-screen text-white">
      <Navbar />

      <section className="container-soft py-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#080808] shadow-2xl">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative grid gap-8 p-6 md:grid-cols-[1fr_380px] md:p-10">
            <div>
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <AvatarView user={user} />

                <div>
                  <span
                    className={`rounded-md px-3 py-1 text-xs font-black text-black ${
                      user.isPremium ? "bg-yellow-400" : "bg-zinc-300"
                    }`}
                  >
                    {user.isPremium ? "PREMIUM MEMBER" : "FREE MEMBER"}
                  </span>

                  <h1 className="mt-4 text-4xl font-black md:text-6xl">
                    {user.name}
                  </h1>

                  <p className="mt-2 break-all text-sm font-bold text-zinc-400">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs font-bold text-zinc-500">Premium</p>
                  <h2 className="mt-2 text-2xl font-black">
                    {user.isPremium ? "ACTIVE" : "LOCKED"}
                  </h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs font-bold text-zinc-500">Expires</p>
                  <h2 className="mt-2 text-lg font-black leading-7">
                    {formatDate(user.premiumExpiresAt)}
                  </h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs font-bold text-zinc-500">Favorite</p>
                  <h2 className="mt-2 text-2xl font-black">
                    {user.favoriteMangas.length}
                  </h2>
                </div>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/10 bg-[#111] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
                    Level
                  </p>
                  <h2 className="mt-2 text-5xl font-black">{user.level}</h2>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 text-3xl">
                  🏆
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs font-black text-zinc-400">
                  <span>
                    XP {xpCurrent} / {xpNeed}
                  </span>
                  <span>{user.progressPercent}%</span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-black">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-orange-500"
                    style={{ width: `${user.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                <p className="text-xs font-black text-yellow-300">
                  Дараагийн reward
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-zinc-200">
                  {user.nextReward}
                </p>
              </div>

              {user.isPremium ? (
                <Link href="/" className="primary-btn mt-6 w-full">
                  Manga унших
                </Link>
              ) : (
                <Link href="/premium" className="primary-btn mt-6 w-full">
                  Premium авах
                </Link>
              )}
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#111] p-6">
            <h2 className="text-2xl font-black">Profile зураг</h2>

            <p className="mt-2 text-sm font-medium leading-6 text-zinc-400">
              Өөрийн зураг upload хийх эсвэл Mangazet default avatar сонгоно.
            </p>

            <label className="mt-5 block rounded-2xl border border-dashed border-white/15 bg-black/25 p-5">
              <span className="block text-sm font-black text-zinc-300">
                Зураг upload хийх
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={uploadProfileImage}
                className="mt-3 w-full text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:font-black file:text-black"
              />

              {uploading && (
                <p className="mt-3 text-sm font-bold text-zinc-400">
                  Upload хийж байна...
                </p>
              )}
            </label>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateProfile({ avatarPreset: "boy" })}
                className={`rounded-2xl border p-4 transition ${
                  user.avatarPreset === "boy" && !user.profileImage
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-white/10 bg-black/25 hover:bg-white/5"
                }`}
              >
                <DefaultAvatar preset="boy" size="small" />
                <p className="mt-3 text-sm font-black">Mangazet boy</p>
              </button>

              <button
                type="button"
                onClick={() => updateProfile({ avatarPreset: "girl" })}
                className={`rounded-2xl border p-4 transition ${
                  user.avatarPreset === "girl" && !user.profileImage
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-white/10 bg-black/25 hover:bg-white/5"
                }`}
              >
                <DefaultAvatar preset="girl" size="small" />
                <p className="mt-3 text-sm font-black">Mangazet girl</p>
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#111] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">Дуртай manga</h2>
              <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                {user.favoriteMangas.length}
              </span>
            </div>

            {user.favoriteMangas.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-10 text-center">
                <p className="text-4xl">♡</p>
                <h3 className="mt-3 text-xl font-black">
                  Дуртай manga байхгүй байна
                </h3>
                <p className="mt-2 text-sm font-bold text-zinc-500">
                  Manga detail дээр heart дарж favorite болгоорой.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {user.favoriteMangas.map((comic) => (
                  <div
                    key={comic.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-3"
                  >
                    <Link href={`/comic/${comic.slug}`}>
                      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-black">
                        <img
                          src={imageSrc(comic.coverImage)}
                          alt={comic.title}
                          className="h-full w-full object-cover"
                        />

                        <span
                          className={`absolute left-2 top-2 rounded-md px-2 py-1 text-[10px] font-black text-black ${
                            comic.status === "COMPLETED"
                              ? "bg-emerald-500"
                              : "bg-yellow-400"
                          }`}
                        >
                          {comic.status === "COMPLETED"
                            ? "COMPLETED"
                            : "ONGOING"}
                        </span>
                      </div>

                      <h3 className="mt-3 line-clamp-2 text-sm font-black">
                        {comic.title}
                      </h3>

                      <p className="mt-1 text-xs font-bold text-zinc-500">
                        {comic.chapters.length} chapters
                      </p>
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(comic.id)}
                      className="mt-3 w-full rounded-xl bg-red-500/15 px-3 py-2 text-xs font-black text-red-300 transition hover:bg-red-500/25"
                    >
                      Favorite-оос хасах
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-[#111] p-5 transition hover:bg-[#181818]"
          >
            <p className="text-2xl">🏠</p>
            <h3 className="mt-3 font-black">Home</h3>
            <p className="mt-1 text-xs font-bold text-zinc-500">
              Manga жагсаалт руу буцах
            </p>
          </Link>

          <Link
            href="/premium"
            className="rounded-2xl border border-white/10 bg-[#111] p-5 transition hover:bg-[#181818]"
          >
            <p className="text-2xl">👑</p>
            <h3 className="mt-3 font-black">Premium</h3>
            <p className="mt-1 text-xs font-bold text-zinc-500">
              Эрх авах / сунгах
            </p>
          </Link>

          <Link
            href="/editor"
            className="rounded-2xl border border-white/10 bg-[#111] p-5 transition hover:bg-[#181818]"
          >
            <p className="text-2xl">✍️</p>
            <h3 className="mt-3 font-black">Editor</h3>
            <p className="mt-1 text-xs font-bold text-zinc-500">
              Manga chapter нэмэх
            </p>
          </Link>

          <Link
            href="/admin"
            className="rounded-2xl border border-white/10 bg-[#111] p-5 transition hover:bg-[#181818]"
          >
            <p className="text-2xl">🛠️</p>
            <h3 className="mt-3 font-black">Admin</h3>
            <p className="mt-1 text-xs font-bold text-zinc-500">
              Хэрэглэгч удирдах
            </p>
          </Link>
        </div>

        <button onClick={logout} className="danger-btn mt-6 px-6 py-3 text-sm">
          Logout
        </button>
      </section>
    </main>
  );
}