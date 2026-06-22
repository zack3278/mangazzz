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
  chapters?: Chapter[];
};

type Chapter = {
  id: string;
  title: string;
  number: number;
  content?: string | null;
  comicId?: string;
};

type UploadResult = {
  message: string;
  url: string;
  key: string;
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
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  if (clean.startsWith("/")) return clean;

  return `/${clean}`;
}

async function uploadImage(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload/r2", {
    method: "POST",
    body: formData,
  });

  const data = (await res.json()) as UploadResult;

  if (!res.ok) {
    throw new Error(data.message || "Upload алдаа");
  }

  return data.url;
}

export default function EditorPage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"manga" | "chapter">("manga");

  const [savingManga, setSavingManga] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [genre1, setGenre1] = useState("");
  const [genre2, setGenre2] = useState("");
  const [genre3, setGenre3] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  const [savingChapter, setSavingChapter] = useState(false);
  const [chapterComicId, setChapterComicId] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterImages, setChapterImages] = useState<string[]>([]);
  const [uploadingChapterImages, setUploadingChapterImages] = useState(false);

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

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);

    try {
      const url = await uploadImage(file, "manga-covers");
      setCoverImage(url);
    } catch (error) {
      console.error(error);
      alert("Cover зураг upload хийхэд алдаа гарлаа");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleChapterImagesUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!chapterComicId) {
      alert("Эхлээд manga сонгоно уу");
      e.target.value = "";
      return;
    }

    if (!chapterNumber.trim()) {
      alert("Эхлээд chapter дугаар оруулна уу");
      e.target.value = "";
      return;
    }

    const selectedComic = comics.find((comic) => comic.id === chapterComicId);
    const selectedSlug = selectedComic?.slug || "comic";
    const folder = `chapters/${selectedSlug}/chapter-${chapterNumber}`;

    setUploadingChapterImages(true);

    try {
      const urls: string[] = [];

      for (const file of files) {
        const url = await uploadImage(file, folder);
        urls.push(url);
      }

      setChapterImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error(error);
      alert("Chapter зураг upload хийхэд алдаа гарлаа");
    } finally {
      setUploadingChapterImages(false);
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

    if (!coverImage.trim()) {
      alert("Cover зураг upload хийнэ үү");
      return;
    }

    const genres = [genre1, genre2, genre3]
      .map((g) => g.trim())
      .filter(Boolean)
      .join(", ");

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
          genre: genres,
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
      setGenre1("");
      setGenre2("");
      setGenre3("");
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

    if (chapterImages.length === 0) {
      alert("Chapter зураг upload хийнэ үү");
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
          content: chapterImages.join("\n"),
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
      setChapterImages([]);

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
            Chapter зураг нэмэх
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

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-300">
                      Genre 1
                    </label>
                    <input
                      value={genre1}
                      onChange={(e) => setGenre1(e.target.value)}
                      placeholder="Action"
                      className="w-full rounded-xl border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-300">
                      Genre 2
                    </label>
                    <input
                      value={genre2}
                      onChange={(e) => setGenre2(e.target.value)}
                      placeholder="Fantasy"
                      className="w-full rounded-xl border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-300">
                      Genre 3
                    </label>
                    <input
                      value={genre3}
                      onChange={(e) => setGenre3(e.target.value)}
                      placeholder="Murim"
                      className="w-full rounded-xl border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Cover зураг
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-red-500"
                  />

                  {uploadingCover && (
                    <p className="mt-2 text-sm text-zinc-400">
                      Cover R2 руу upload хийж байна...
                    </p>
                  )}

                  {coverImage && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-black/50 p-3">
                      <img
                        src={getCoverSrc(coverImage)}
                        alt="Cover preview"
                        className="h-44 w-32 rounded-lg object-cover"
                      />

                      <p className="mt-2 break-all text-xs text-green-400">
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
                  disabled={savingManga || uploadingCover}
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
                Chapter зураг нэмэх
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Manga сонгох
                  </label>
                  <select
                    value={chapterComicId}
                    onChange={(e) => {
                      setChapterComicId(e.target.value);
                      setChapterImages([]);
                    }}
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
                    onChange={(e) => {
                      setChapterNumber(e.target.value);
                      setChapterImages([]);
                    }}
                    placeholder="1"
                    type="number"
                    min="1"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Chapter нэр
                  </label>
                  <input
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    placeholder="Chapter 1"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Chapter зургууд
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleChapterImagesUpload}
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-red-500"
                  />

                  <p className="mt-2 text-xs text-zinc-500">
                    Эхлээд manga сонгоод chapter дугаараа оруулсны дараа зураг
                    upload хийнэ.
                  </p>

                  {uploadingChapterImages && (
                    <p className="mt-2 text-sm text-zinc-400">
                      Chapter зургууд R2 руу upload хийж байна...
                    </p>
                  )}

                  {chapterImages.length > 0 && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-black/50 p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-bold text-zinc-300">
                          Upload хийсэн зураг: {chapterImages.length}
                        </p>

                        <button
                          type="button"
                          onClick={() => setChapterImages([])}
                          className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-bold text-white hover:bg-red-600"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {chapterImages.map((url, index) => (
                          <div
                            key={`${url}-${index}`}
                            className="relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900"
                          >
                            <img
                              src={getCoverSrc(url)}
                              alt={`Page ${index + 1}`}
                              className="h-36 w-full object-cover"
                            />
                            <span className="absolute left-1 top-1 rounded bg-black/80 px-2 py-1 text-[10px] font-bold text-white">
                              {index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={savingChapter || uploadingChapterImages}
                  className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingChapter ? "Хадгалж байна..." : "Chapter хадгалах"}
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
                          setChapterImages([]);
                        }}
                        className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500"
                      >
                        Chapter зураг нэмэх
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