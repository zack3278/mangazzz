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
  chapters?: Chapter[];
};

type Chapter = {
  id: string;
  title: string;
  number: number;
  content?: string | null;
  comicId?: string;
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

  const [activeTab, setActiveTab] = useState<"manga" | "chapter">("manga");

  const [savingManga, setSavingManga] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const [savingChapter, setSavingChapter] = useState(false);
  const [chapterComicId, setChapterComicId] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterContent, setChapterContent] = useState("");

  async function loadComics() {
    try {
      setLoading(true);

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
      console.error("LOAD_COMICS_ERROR:", error);
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

  async function handleMangaSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Manga нэр оруулна уу");
      return;
    }

    if (!slug.trim()) {
      alert("Slug оруулна уу");
      return;
    }

    setSavingManga(true);

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
      setActiveTab("chapter");
    } catch (error) {
      console.error("CREATE_MANGA_ERROR:", error);
      alert("Server алдаа гарлаа");
    } finally {
      setSavingManga(false);
    }
  }

  async function handleChapterSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!chapterComicId) {
      alert("Manga сонгоно уу");
      return;
    }

    if (!chapterTitle.trim()) {
      alert("Chapter гарчиг оруулна уу");
      return;
    }

    if (!chapterNumber.trim()) {
      alert("Chapter дугаар оруулна уу");
      return;
    }

    const parsedNumber = Number(chapterNumber);

    if (Number.isNaN(parsedNumber) || parsedNumber <= 0) {
      alert("Chapter дугаар зөв оруулна уу");
      return;
    }

    if (!chapterContent.trim()) {
      alert("Chapter content оруулна уу");
      return;
    }

    setSavingChapter(true);

    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comicId: chapterComicId,
          title: chapterTitle.trim(),
          number: parsedNumber,
          content: chapterContent.trim(),
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
      setChapterContent("");

      await loadComics();
    } catch (error) {
      console.error("CREATE_CHAPTER_ERROR:", error);
      alert("Server алдаа гарлаа");
    } finally {
      setSavingChapter(false);
    }
  }

  const selectedComic = comics.find((comic) => comic.id === chapterComicId);

  return (
    <main className="min-h-screen bg-[#020202] text-white">
      <Navbar />

      <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-400">
              Editor Panel
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-white">
              Manga / Chapter нэмэх
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-red-600 hover:text-white"
          >
            Нүүр рүү буцах
          </Link>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("manga")}
            className={
              activeTab === "manga"
                ? "rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
                : "rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-zinc-300 hover:bg-white/10"
            }
          >
            Manga нэмэх
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chapter")}
            className={
              activeTab === "chapter"
                ? "rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
                : "rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-zinc-300 hover:bg-white/10"
            }
          >
            Chapter нэмэх
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[430px_1fr]">
          {activeTab === "manga" ? (
            <form
              onSubmit={handleMangaSubmit}
              className="rounded-2xl border border-white/10 bg-[#090909] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
            >
              <h2 className="mb-4 text-xl font-bold text-white">
                Шинэ manga нэмэх
              </h2>

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
                    Cover image URL
                  </label>
                  <input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://... эсвэл /cover/manga.jpg"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                  />

                  {coverImage && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-black/50 p-3">
                      <img
                        src={getCoverSrc(coverImage)}
                        alt="Cover preview"
                        className="h-44 w-32 rounded-lg object-cover"
                      />
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
                  disabled={savingManga}
                  className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingManga ? "Хадгалж байна..." : "Manga нэмэх"}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleChapterSubmit}
              className="rounded-2xl border border-white/10 bg-[#090909] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
            >
              <h2 className="mb-4 text-xl font-bold text-white">
                Шинэ chapter нэмэх
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Manga сонгох
                  </label>
                  <select
                    value={chapterComicId}
                    onChange={(e) => setChapterComicId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                  >
                    <option value="">Manga сонгоно уу</option>
                    {comics.map((comic) => (
                      <option key={comic.id} value={comic.id}>
                        {comic.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedComic && (
                  <div className="grid grid-cols-[76px_1fr] gap-3 rounded-xl border border-white/10 bg-black/50 p-3">
                    <img
                      src={getCoverSrc(selectedComic.coverImage)}
                      alt={selectedComic.title}
                      className="h-28 w-20 rounded-lg object-cover"
                    />

                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-bold text-white">
                        {selectedComic.title}
                      </p>
                      <p className="mt-1 text-xs font-medium text-zinc-500">
                        {selectedComic.genre || "No genre"}
                      </p>
                      <p className="mt-2 text-xs font-medium text-zinc-400">
                        Chapters: {selectedComic.chapters?.length || 0}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Chapter дугаар
                  </label>
                  <input
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(e.target.value)}
                    placeholder="1"
                    type="number"
                    min="1"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Chapter гарчиг
                  </label>
                  <input
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    placeholder="Эхлэл"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Chapter content
                  </label>
                  <textarea
                    value={chapterContent}
                    onChange={(e) => setChapterContent(e.target.value)}
                    rows={12}
                    placeholder="Chapter-ийн текстээ энд бичнэ..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingChapter}
                  className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingChapter ? "Хадгалж байна..." : "Chapter нэмэх"}
                </button>
              </div>
            </form>
          )}

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
                  <div
                    key={comic.id}
                    className="grid grid-cols-[92px_1fr] overflow-hidden rounded-xl border border-white/10 bg-black"
                  >
                    <Link
                      href={`/comic/${comic.slug}`}
                      className="relative h-36 overflow-hidden bg-zinc-900"
                    >
                      <img
                        src={getCoverSrc(comic.coverImage)}
                        alt={comic.title}
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    </Link>

                    <div className="min-w-0 p-3">
                      <Link
                        href={`/comic/${comic.slug}`}
                        className="line-clamp-2 text-sm font-bold text-white hover:text-red-300"
                      >
                        {comic.title}
                      </Link>

                      <p className="mt-1 line-clamp-1 text-xs font-medium text-zinc-500">
                        {comic.genre || "No genre"}
                      </p>

                      <p className="mt-2 text-xs font-medium text-zinc-400">
                        Chapters: {comic.chapters?.length || 0}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("chapter");
                          setChapterComicId(comic.id);
                          setChapterNumber(
                            String((comic.chapters?.length || 0) + 1)
                          );
                        }}
                        className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500"
                      >
                        Chapter нэмэх
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}