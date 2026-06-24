"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type Comic = {
  id: number;
  title: string;
  slug: string;
  author?: string | null;
  genre?: string | null;
  genre2?: string | null;
  genre3?: string | null;
  description?: string | null;
  coverImage?: string | null;
  bannerImage?: string | null;
  status?: string | null;
  chapters?: Chapter[];
};

type Chapter = {
  id: number;
  title: string;
  number: number;
};

type UploadResult = {
  message: string;
  url: string;
  key: string;
};

const GENRES = [
  "Action",
  "Adventure",
  "Fantasy",
  "Drama",
  "Romance",
  "Comedy",
  "School",
  "Sports",
  "Martial Arts",
  "Magic",
  "Reincarnation",
  "Regression",
  "Dungeon",
  "Leveling",
  "Murim",
  "Supernatural",
  "Horror",
  "Thriller",
  "Mystery",
  "Slice of Life",
  "Бусад",
];

function makeSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function imageSrc(src?: string | null) {
  if (!src) return "/placeholder-cover.jpg";

  const clean = src.trim();

  if (!clean || clean.startsWith("blob:") || clean.includes("fakepath")) {
    return "/placeholder-cover.jpg";
  }

  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("/")
  ) {
    return clean;
  }

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

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [genre1, setGenre1] = useState("");
  const [genre2, setGenre2] = useState("");
  const [genre3, setGenre3] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"ONGOING" | "COMPLETED">("ONGOING");

  const [coverImage, setCoverImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [savingManga, setSavingManga] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [chapterComicId, setChapterComicId] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterImages, setChapterImages] = useState<string[]>([]);
  const [savingChapter, setSavingChapter] = useState(false);
  const [uploadingChapterImages, setUploadingChapterImages] = useState(false);

  async function loadComics() {
    try {
      setLoading(true);

      const res = await fetch("/api/comics", {
        cache: "no-store",
      });

      const data = await res.json();

      setComics(Array.isArray(data) ? data : data.comics || []);
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

  function handleGenre1(value: string) {
    setGenre1(value);

    if (genre2 === value) {
      setGenre2("");
    }

    if (genre3 === value) {
      setGenre3("");
    }
  }

  function handleGenre2(value: string) {
    setGenre2(value);

    if (genre3 === value) {
      setGenre3("");
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
      console.error("COVER_UPLOAD_ERROR:", error);
      alert("Cover зураг upload хийхэд алдаа гарлаа");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadingBanner(true);

    try {
      const url = await uploadImage(file, "manga-banners");
      setBannerImage(url);
    } catch (error) {
      console.error("BANNER_UPLOAD_ERROR:", error);
      alert("Banner зураг upload хийхэд алдаа гарлаа");
    } finally {
      setUploadingBanner(false);
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

    const selectedComic = comics.find(
      (comic) => String(comic.id) === chapterComicId
    );

    const folder = `chapters/${
      selectedComic?.slug || "comic"
    }/chapter-${chapterNumber}`;

    setUploadingChapterImages(true);

    try {
      const urls: string[] = [];

      for (const file of files) {
        const url = await uploadImage(file, folder);
        urls.push(url);
      }

      setChapterImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("CHAPTER_IMAGES_UPLOAD_ERROR:", error);
      alert("Chapter зураг upload хийхэд алдаа гарлаа");
    } finally {
      setUploadingChapterImages(false);
    }
  }

  async function handleMangaSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return alert("Manga нэр оруулна уу");
    if (!slug.trim()) return alert("Slug оруулна уу");
    if (!genre1.trim()) return alert("Genre 1 сонгоно уу");
    if (!description.trim()) return alert("Тайлбар оруулна уу");
    if (!coverImage.trim()) return alert("Cover зураг upload хийнэ үү");

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
          author: author.trim() || null,
          genre: genre1.trim(),
          genre2: genre2.trim() || null,
          genre3: genre3.trim() || null,
          description: description.trim(),
          coverImage: coverImage.trim(),
          bannerImage: bannerImage.trim() || null,
          status,
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
      setBannerImage("");
      setStatus("ONGOING");

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

    if (uploadingChapterImages) return alert("Зураг upload дуусаагүй байна");
    if (!chapterComicId) return alert("Manga сонгоно уу");
    if (!chapterNumber.trim()) return alert("Chapter дугаар оруулна уу");
    if (!chapterTitle.trim()) return alert("Chapter нэр оруулна уу");

    const parsedComicId = Number(chapterComicId);
    const parsedNumber = Number(chapterNumber);

    if (Number.isNaN(parsedComicId) || parsedComicId <= 0) {
      return alert("Manga ID буруу байна");
    }

    if (Number.isNaN(parsedNumber) || parsedNumber <= 0) {
      return alert("Chapter дугаар буруу байна");
    }

    if (chapterImages.length === 0) {
      return alert("Chapter зураг upload хийнэ үү");
    }

    setSavingChapter(true);

    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comicId: parsedComicId,
          mangaId: parsedComicId,
          title: chapterTitle.trim(),
          chapterTitle: chapterTitle.trim(),
          number: parsedNumber,
          chapterNumber: parsedNumber,
          images: chapterImages,
          imageUrls: chapterImages,
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

  const selectedComic = comics.find(
    (comic) => String(comic.id) === chapterComicId
  );

  return (
    <main className="site-shell min-h-screen text-white">
      <Navbar />

      <section className="container-soft py-10">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <span className="badge badge-red">Editor Panel</span>

              <h1 className="mt-4 text-4xl font-black">
                Manga / Chapter нэмэх
              </h1>

              <p className="mt-2 text-zinc-400">
                Cover зураг card дээр, Hero banner зураг home-ийн том banner
                дээр гарна. Genre 1 заавал, Genre 2/3 сонголтоор.
              </p>
            </div>

            <Link href="/" className="secondary-btn">
              Нүүр рүү буцах
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("manga")}
            className={activeTab === "manga" ? "primary-btn" : "secondary-btn"}
          >
            Manga нэмэх
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chapter")}
            className={activeTab === "chapter" ? "primary-btn" : "secondary-btn"}
          >
            Chapter зураг нэмэх
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          {activeTab === "manga" ? (
            <form
              onSubmit={handleMangaSubmit}
              className="glass-card rounded-[2rem] p-6"
            >
              <h2 className="text-2xl font-black">Шинэ manga нэмэх</h2>

              <div className="mt-5 grid gap-4">
                <input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Manga нэр"
                  className="soft-input"
                />

                <input
                  value={slug}
                  onChange={(e) => setSlug(makeSlug(e.target.value))}
                  placeholder="Slug"
                  className="soft-input"
                />

                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Зохиогч"
                  className="soft-input"
                />

                <div className="grid gap-3 md:grid-cols-3">
                  <select
                    value={genre1}
                    onChange={(e) => handleGenre1(e.target.value)}
                    className="soft-input"
                  >
                    <option value="">Genre 1 сонгох</option>
                    {GENRES.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>

                  <select
                    value={genre2}
                    onChange={(e) => handleGenre2(e.target.value)}
                    className="soft-input"
                  >
                    <option value="">Genre 2 сонгох</option>
                    {GENRES.filter((genre) => genre !== genre1).map(
                      (genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    value={genre3}
                    onChange={(e) => setGenre3(e.target.value)}
                    className="soft-input"
                  >
                    <option value="">Genre 3 сонгох</option>
                    {GENRES.filter(
                      (genre) => genre !== genre1 && genre !== genre2
                    ).map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "ONGOING" | "COMPLETED")
                  }
                  className="soft-input"
                >
                  <option value="ONGOING">ONGOING</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>

                <label className="rounded-2xl border border-dashed border-white/15 bg-black/25 p-5">
                  <span className="block text-sm font-black text-zinc-300">
                    Cover зураг
                  </span>

                  <p className="mt-1 text-xs font-bold text-zinc-500">
                    Card, trending, detail дээр гарах босоо poster зураг.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="mt-3 w-full text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:font-black file:text-black"
                  />

                  {uploadingCover && (
                    <p className="mt-3 text-sm font-bold text-zinc-400">
                      Cover R2 руу upload хийж байна...
                    </p>
                  )}

                  {coverImage && (
                    <div className="mt-4 grid gap-3 md:grid-cols-[110px_1fr] md:items-center">
                      <img
                        src={imageSrc(coverImage)}
                        alt="Cover preview"
                        className="h-36 w-24 rounded-xl object-cover"
                      />
                      <p className="break-all text-xs font-bold text-emerald-300">
                        {coverImage}
                      </p>
                    </div>
                  )}
                </label>

                <label className="rounded-2xl border border-dashed border-white/15 bg-black/25 p-5">
                  <span className="block text-sm font-black text-zinc-300">
                    Hero banner зураг
                  </span>

                  <p className="mt-1 text-xs font-bold text-zinc-500">
                    Home page-ийн хамгийн том banner дээр гарна. 1600x700 эсвэл
                    1920x800 хэмжээтэй хэвтээ зураг хийвэл хамгийн гоё.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="mt-3 w-full text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:font-black file:text-black"
                  />

                  {uploadingBanner && (
                    <p className="mt-3 text-sm font-bold text-zinc-400">
                      Banner R2 руу upload хийж байна...
                    </p>
                  )}

                  {bannerImage && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black">
                      <img
                        src={imageSrc(bannerImage)}
                        alt="Banner preview"
                        className="h-44 w-full object-cover"
                      />
                    </div>
                  )}
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Manga тайлбар..."
                  className="soft-input resize-none"
                />

                <button
                  type="submit"
                  disabled={savingManga || uploadingCover || uploadingBanner}
                  className="primary-btn w-full"
                >
                  {savingManga ? "Хадгалж байна..." : "Manga нэмэх"}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleChapterSubmit}
              className="glass-card rounded-[2rem] p-6"
            >
              <h2 className="text-2xl font-black">Chapter зураг нэмэх</h2>

              <div className="mt-5 grid gap-4">
                <select
                  value={chapterComicId}
                  onChange={(e) => {
                    setChapterComicId(e.target.value);
                    setChapterImages([]);
                  }}
                  className="soft-input"
                >
                  <option value="">Manga сонгоно уу</option>

                  {comics.map((comic) => (
                    <option key={comic.id} value={String(comic.id)}>
                      {comic.title}
                    </option>
                  ))}
                </select>

                {selectedComic && (
                  <div className="grid grid-cols-[90px_1fr] gap-4 rounded-2xl border border-white/10 bg-black/25 p-3">
                    <img
                      src={imageSrc(selectedComic.coverImage)}
                      alt={selectedComic.title}
                      className="h-32 w-24 rounded-2xl object-cover"
                    />

                    <div className="min-w-0">
                      <p className="line-clamp-2 text-lg font-black">
                        {selectedComic.title}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedComic.genre && (
                          <span className="rounded-md bg-yellow-400/15 px-2 py-1 text-[10px] font-black text-yellow-300">
                            {selectedComic.genre}
                          </span>
                        )}
                        {selectedComic.genre2 && (
                          <span className="rounded-md bg-yellow-400/15 px-2 py-1 text-[10px] font-black text-yellow-300">
                            {selectedComic.genre2}
                          </span>
                        )}
                        {selectedComic.genre3 && (
                          <span className="rounded-md bg-yellow-400/15 px-2 py-1 text-[10px] font-black text-yellow-300">
                            {selectedComic.genre3}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm font-bold text-zinc-400">
                        Chapters: {selectedComic.chapters?.length || 0}
                      </p>
                    </div>
                  </div>
                )}

                <input
                  value={chapterNumber}
                  onChange={(e) => {
                    setChapterNumber(e.target.value);
                    setChapterImages([]);
                  }}
                  placeholder="Chapter дугаар"
                  type="number"
                  min="1"
                  className="soft-input"
                />

                <input
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="Chapter нэр"
                  className="soft-input"
                />

                <label className="rounded-2xl border border-dashed border-white/15 bg-black/25 p-5">
                  <span className="block text-sm font-black text-zinc-300">
                    Chapter зургууд
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleChapterImagesUpload}
                    className="mt-3 w-full text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:font-black file:text-black"
                  />

                  <p className="mt-2 text-xs text-zinc-500">
                    Дараалал: Manga сонго → Chapter дугаар → Chapter нэр →
                    зураг сонго → Chapter хадгалах.
                  </p>

                  {uploadingChapterImages && (
                    <p className="mt-3 text-sm font-bold text-zinc-400">
                      Chapter зургууд R2 руу upload хийж байна...
                    </p>
                  )}
                </label>

                {chapterImages.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-black text-zinc-300">
                        Upload хийсэн зураг: {chapterImages.length}
                      </p>

                      <button
                        type="button"
                        onClick={() => setChapterImages([])}
                        className="danger-btn"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                      {chapterImages.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-950"
                        >
                          <img
                            src={imageSrc(url)}
                            alt={`Page ${index + 1}`}
                            className="h-36 w-full object-cover"
                          />

                          <span className="absolute left-2 top-2 rounded-lg bg-black/80 px-2 py-1 text-[10px] font-black text-white">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    savingChapter ||
                    uploadingChapterImages ||
                    !chapterComicId ||
                    !chapterNumber ||
                    !chapterTitle ||
                    chapterImages.length === 0
                  }
                  className="primary-btn w-full"
                >
                  {savingChapter ? "Хадгалж байна..." : "Chapter хадгалах"}
                </button>
              </div>
            </form>
          )}

          <section className="glass-card rounded-[2rem] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">Нэмэгдсэн manga</h2>
              <span className="badge">{comics.length}</span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-8 text-center text-sm font-black text-zinc-500">
                Уншиж байна...
              </div>
            ) : comics.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-8 text-center text-sm font-black text-zinc-500">
                Manga байхгүй байна.
              </div>
            ) : (
              <div className="grid gap-3">
                {comics.map((comic) => (
                  <div
                    key={comic.id}
                    className="grid grid-cols-[84px_1fr] gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
                  >
                    <Link
                      href={`/comic/${comic.slug}`}
                      className="overflow-hidden rounded-xl bg-zinc-950"
                    >
                      <img
                        src={imageSrc(comic.coverImage)}
                        alt={comic.title}
                        className="h-32 w-full object-cover transition hover:scale-105"
                      />
                    </Link>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/comic/${comic.slug}`}
                          className="line-clamp-2 text-sm font-black hover:text-yellow-300"
                        >
                          {comic.title}
                        </Link>

                        <span
                          className={`rounded-md px-2 py-1 text-[10px] font-black text-black ${
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

                      <div className="mt-2 flex flex-wrap gap-1">
                        {comic.genre && (
                          <span className="rounded-md bg-yellow-400/15 px-2 py-1 text-[10px] font-black text-yellow-300">
                            {comic.genre}
                          </span>
                        )}
                        {comic.genre2 && (
                          <span className="rounded-md bg-yellow-400/15 px-2 py-1 text-[10px] font-black text-yellow-300">
                            {comic.genre2}
                          </span>
                        )}
                        {comic.genre3 && (
                          <span className="rounded-md bg-yellow-400/15 px-2 py-1 text-[10px] font-black text-yellow-300">
                            {comic.genre3}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-xs font-bold text-zinc-400">
                        Chapters: {comic.chapters?.length || 0}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("chapter");
                          setChapterComicId(String(comic.id));
                          setChapterTitle(
                            `Chapter ${(comic.chapters?.length || 0) + 1}`
                          );
                          setChapterNumber(
                            String((comic.chapters?.length || 0) + 1)
                          );
                          setChapterImages([]);
                        }}
                        className="secondary-btn mt-3 px-3 py-2 text-xs"
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