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
      <main className="min-h-screen bg-[#090511] p-6 text-white">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          Шалгаж байна...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090511] text-white">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl font-black shadow-lg shadow-violet-950/40">
              E
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
                Editor Panel
              </p>

              <h1 className="mt-1 text-3xl font-black">Chapter upload</h1>

              <p className="mt-1 text-sm text-zinc-400">
                Зөвхөн chapter нэмэх эрхтэй.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10"
            >
              Home
            </Link>

            <button
              onClick={logout}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={addChapter}
            className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
              Upload
            </p>

            <h2 className="mt-3 text-3xl font-black">Chapter нэмэх</h2>

            <p className="mt-2 text-sm text-zinc-400">
              Comic сонгоод title, number, зургаа upload хийнэ.
            </p>

            {comics.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-[#110c1d] p-6 text-zinc-300">
                Одоогоор comic байхгүй байна. Admin эхлээд comic нэмэх хэрэгтэй.
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <label className="mb-2 block text-sm text-zinc-300">
                    Comic сонгох
                  </label>

                  <select
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#110c1d] px-4 text-white outline-none focus:border-violet-500"
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
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-zinc-300">
                      Chapter title
                    </label>

                    <input
                      className="h-14 w-full rounded-2xl border border-white/10 bg-[#110c1d] px-4 text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
                      placeholder="Жишээ: Эхлэл"
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-zinc-300">
                      Chapter number
                    </label>

                    <input
                      type="number"
                      className="h-14 w-full rounded-2xl border border-white/10 bg-[#110c1d] px-4 text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
                      placeholder="Жишээ: 1"
                      value={chapterNumber}
                      onChange={(e) => setChapterNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm text-zinc-300">
                    Chapter зурагнууд
                  </label>

                  <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-violet-400/30 bg-violet-500/10 p-6 text-center hover:bg-violet-500/15">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl font-black">
                      +
                    </span>

                    <span className="mt-3 font-bold">Зургаа сонгох</span>
                    <span className="mt-1 text-sm text-zinc-400">
                      Multiple image upload болно
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => uploadChapterImages(e.target.files)}
                    />
                  </label>

                  {uploading && (
                    <p className="mt-3 text-sm text-violet-200">
                      Зураг upload хийж байна...
                    </p>
                  )}
                </div>

                {imageUrls.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-bold">Uploaded pages</h3>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                        {imageUrls.length} images
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {imageUrls.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="rounded-[22px] border border-white/10 bg-[#110c1d] p-2"
                        >
                          <img
                            src={url}
                            alt={`Page ${index + 1}`}
                            className="h-40 w-full rounded-2xl object-cover"
                          />

                          <div className="mt-2 flex items-center justify-between gap-2">
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
                  className="mt-6 h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-white shadow-lg shadow-violet-950/40 disabled:cursor-not-allowed disabled:bg-zinc-700"
                >
                  {saving ? "Хадгалж байна..." : "Chapter нэмэх"}
                </button>
              </>
            )}
          </form>

          <aside className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
              Guide
            </p>

            <h2 className="mt-3 text-2xl font-black">Editor хийх зүйл</h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-[#110c1d] p-4">
                <p className="font-bold">1. Comic сонгоно</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Admin-ийн нэмсэн comic жагсаалтаас сонгоно.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#110c1d] p-4">
                <p className="font-bold">2. Chapter мэдээлэл</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Chapter title болон number оруулна.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#110c1d] p-4">
                <p className="font-bold">3. Зураг upload</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Chapter-ийн бүх page зургаа зэрэг upload хийнэ.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}