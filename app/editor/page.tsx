"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type Comic = {
  id: string;
  title: string;
  slug: string;
  author?: string | null;
  genre?: string | null;
  description?: string | null;
  coverImage?: string | null;
  createdAt?: string;
};

function makeSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getCoverSrc(src?: string | null) {
  if (!src) return "/placeholder-cover.jpg";

  const clean = src.trim();

  if (!clean) return "/placeholder-cover.jpg";
  if (clean.startsWith("blob:")) return "/placeholder-cover.jpg";
  if (clean.includes("fakepath")) return "/placeholder-cover.jpg";

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  if (clean.startsWith("/")) {
    return clean;
  }

  return `/${clean}`;
}

export default function EditorPage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadComics() {
    try {
      const res = await fetch("/api/comics", {
        cache: "no-store",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setComics(data);
      } else if (Array.isArray(data.comics)) {
        setComics(data.comics);
      } else {
        setComics([]);
      }
    } catch (error) {
      console.error(error);
      setComics([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComics();
  }, []);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slug.trim()) {
      setSlug(makeSlug(value));
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Upload алдаа гарлаа");
        return;
      }

      setCoverImage(data.url);
    } catch (error) {
      console.error(error);
      alert("Зураг upload хийхэд алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Manga нэр оруулна уу");
      return;
    }

    if (!slug.trim()) {
      alert("Slug оруулна уу");
      return;
    }

    if (!coverImage.trim()) {
      alert("Cover зураг upload хийнэ үү");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/comics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          author: author.trim(),
          genre: genre.trim(),
          description: description.trim(),
          coverImage: coverImage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Manga нэмэхэд алдаа гарлаа");
        return;
      }

      alert("Manga амжилттай нэмэгдлээ");

      setTitle("");
      setSlug("");
      setAuthor("");
      setGenre("");
      setDescription("");
      setCoverImage("");

      await loadComics();
    } catch (error) {
      console.error(error);
      alert("Server алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020202] text-white">
      <Navbar />

      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-400">
              Editor Panel
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-white">
              Manga нэмэх
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-red-600 hover:text-white"
          >
            Нүүр рүү буцах
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-[#090909] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Manga нэр
                </label>
                <input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Жишээ: Nano Machine"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Slug
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(makeSlug(e.target.value))}
                  placeholder="nano-machine"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Зохиогч
                </label>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Genre
                </label>
                <input
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Action, Fantasy"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Cover зураг upload
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-red-500"
                />

                {uploading && (
                  <p className="mt-2 text-sm font-medium text-zinc-400">
                    Зураг upload хийж байна...
                  </p>
                )}

                {coverImage && (
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/50 p-3">
                    <img
                      src={getCoverSrc(coverImage)}
                      alt="Cover preview"
                      className="h-44 w-32 rounded-lg object-cover"
                    />
                    <p className="mt-2 break-all text-xs font-medium text-zinc-500">
                      {coverImage}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Тайлбар
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Manga тайлбар..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Хадгалж байна..." : "Manga нэмэх"}
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-white/10 bg-[#090909] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Нэмэгдсэн manga</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-zinc-300">
                {comics.length}
              </span>
            </div>

            {loading ? (
              <div className="rounded-xl border border-white/10 bg-black p-6 text-center text-sm font-bold text-zinc-500">
                Уншиж байна...
              </div>
            ) : comics.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black p-6 text-center text-sm font-bold text-zinc-500">
                Manga байхгүй байна.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {comics.map((comic) => (
                  <Link
                    key={comic.id}
                    href={`/comic/${comic.slug}`}
                    className="group grid grid-cols-[92px_1fr] overflow-hidden rounded-xl border border-white/10 bg-black transition hover:border-red-500/60"
                  >
                    <div className="relative h-36 overflow-hidden bg-zinc-900">
                      <img
                        src={getCoverSrc(comic.coverImage)}
                        alt={comic.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>

                    <div className="min-w-0 p-3">
                      <h3 className="line-clamp-2 text-sm font-bold text-white group-hover:text-red-300">
                        {comic.title}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-xs font-medium text-zinc-500">
                        {comic.genre || "No genre"}
                      </p>

                      <p className="mt-3 line-clamp-3 text-xs leading-5 text-zinc-400">
                        {comic.description || "Тайлбар байхгүй"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}