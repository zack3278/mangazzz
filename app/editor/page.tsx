"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Comic = {
  id: number;
  title: string;
  slug: string;
};

export default function EditorPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [comics, setComics] = useState<Comic[]>([]);
  const [selectedComicId, setSelectedComicId] = useState("");

  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadComics() {
    const res = await fetch("/api/comics");
    const data = await res.json();

    if (Array.isArray(data)) {
      setComics(data);
    }
  }

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!res.ok || !data.user) {
        location.href = "/login";
        return;
      }

      if (data.user.role !== "EDITOR" && data.user.role !== "ADMIN") {
        location.href = "/";
        return;
      }

      setCheckingAuth(false);
      loadComics();
    }

    checkAuth();
  }, []);

  async function uploadChapterImages(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "chapter");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Зураг upload хийхэд алдаа гарлаа");
          continue;
        }

        uploadedUrls.push(data.url);
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls]);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function addChapter(e: FormEvent) {
    e.preventDefault();

    if (!selectedComicId) {
      alert("Comic сонгоно уу");
      return;
    }

    if (!chapterTitle || !chapterNumber) {
      alert("Chapter title болон number оруулна уу");
      return;
    }

    if (imageUrls.length === 0) {
      alert("Chapter зураг оруулна уу");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: chapterTitle,
          number: Number(chapterNumber),
          comicId: Number(selectedComicId),
          images: imageUrls,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Chapter нэмэхэд алдаа гарлаа");
        return;
      }

      alert("Chapter амжилттай нэмэгдлээ");

      setChapterTitle("");
      setChapterNumber("");
      setSelectedComicId("");
      setImageUrls([]);
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    location.href = "/login";
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4">
          Шалгаж байна...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-2xl font-black shadow-lg shadow-red-600/30">
              E
            </div>

            <div>
              <h1 className="text-2xl font-black">Editor Panel</h1>
              <p className="text-sm text-zinc-400">
                Зөвхөн chapter нэмэх эрхтэй.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Home
            </Link>

            <button
              onClick={logout}
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold shadow-lg shadow-red-600/30 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <form
          onSubmit={addChapter}
          className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30"
        >
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
              Chapter upload
            </p>
            <h2 className="mt-2 text-3xl font-black">Chapter нэмэх</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Comic сонгоод title, number, зургаа upload хийнэ.
            </p>
          </div>

          {comics.length === 0 ? (
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-yellow-200">
              Одоогоор comic байхгүй байна. Admin эхлээд comic нэмэх хэрэгтэй.
            </div>
          ) : (
            <>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Comic сонгох
              </label>
              <select
                className="mb-5 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 outline-none focus:border-red-500"
                value={selectedComicId}
                onChange={(e) => setSelectedComicId(e.target.value)}
              >
                <option value="">Comic сонгох</option>

                {comics.map((comic) => (
                  <option key={comic.id} value={comic.id}>
                    {comic.title} / {comic.slug}
                  </option>
                ))}
              </select>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">
                    Chapter title
                  </label>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 outline-none focus:border-red-500"
                    placeholder="Жишээ: Эхлэл"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">
                    Chapter number
                  </label>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 outline-none focus:border-red-500"
                    placeholder="Жишээ: 1"
                    type="number"
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  Chapter зурагнууд
                </label>

                <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-zinc-900 p-8 text-center hover:border-red-500/60">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-2xl">
                    +
                  </div>

                  <p className="font-bold">Зургаа сонгох</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Multiple image upload болно
                  </p>

                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => uploadChapterImages(e.target.files)}
                  />
                </label>
              </div>

              {uploading && (
                <p className="mt-4 rounded-2xl bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
                  Зураг upload хийж байна...
                </p>
              )}

              {imageUrls.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold">Uploaded pages</h3>
                    <p className="text-sm text-zinc-500">
                      {imageUrls.length} images
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {imageUrls.map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-2"
                      >
                        <img
                          src={url}
                          alt="chapter preview"
                          className="h-44 w-full rounded-xl object-cover"
                        />

                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-xs text-zinc-400">
                            Page {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="rounded-full bg-red-600 px-3 py-1 text-xs hover:bg-red-700"
                          >
                            Устгах
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                disabled={saving || uploading}
                className="mt-6 w-full rounded-2xl bg-red-600 py-4 font-bold shadow-lg shadow-red-600/30 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:shadow-none"
              >
                {saving ? "Хадгалж байна..." : "Chapter нэмэх"}
              </button>
            </>
          )}
        </form>

        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
            Guide
          </p>

          <h2 className="mt-2 text-2xl font-black">Editor хийх зүйл</h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-zinc-900 p-4">
              <p className="font-bold">1. Comic сонгоно</p>
              <p className="mt-1 text-sm text-zinc-400">
                Admin-ийн нэмсэн comic жагсаалтаас сонгоно.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-4">
              <p className="font-bold">2. Chapter мэдээлэл</p>
              <p className="mt-1 text-sm text-zinc-400">
                Chapter title болон number оруулна.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-4">
              <p className="font-bold">3. Зураг upload</p>
              <p className="mt-1 text-sm text-zinc-400">
                Chapter-ийн бүх page зургаа зэрэг upload хийнэ.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}