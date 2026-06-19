/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

type Props = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
  }>;
};

function makeQueryLink(q: string, genre: string) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (genre) params.set("genre", genre);

  return `/?${params.toString()}`;
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const selectedGenre = params.genre?.trim() || "";

  const genreSource = await prisma.comic.findMany({
    select: {
      genre: true,
      genre2: true,
      genre3: true,
    },
  });

  const genres = Array.from(
    new Set(
      genreSource
        .flatMap((comic) => [comic.genre, comic.genre2, comic.genre3])
        .filter((genre): genre is string => Boolean(genre && genre.trim()))
    )
  ).sort();

  const comics = await prisma.comic.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                {
                  title: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  author: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  genre: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  genre2: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  genre3: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {},
        selectedGenre
          ? {
              OR: [
                { genre: selectedGenre },
                { genre2: selectedGenre },
                { genre3: selectedGenre },
              ],
            }
          : {},
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      chapters: true,
    },
  });

  const popularComics = await prisma.comic.findMany({
    orderBy: {
      views: "desc",
    },
    take: 8,
    include: {
      chapters: true,
    },
  });

  const totalComics = await prisma.comic.count();
  const featuredComic = popularComics[0] || comics[0] || null;
  const totalChapters = comics.reduce(
    (sum, comic) => sum + comic.chapters.length,
    0
  );

  return (
    <main className="min-h-screen text-white">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute left-[-120px] top-[-60px] h-72 w-72 rounded-full bg-violet-700/25 blur-3xl" />
          <div className="absolute right-[-90px] top-16 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl" />
          <div className="absolute bottom-[-80px] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-900/30 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-14">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              Dark Purple Manga Platform
            </div>

            <h1 className="max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
              Манга, манхва, комикоо
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-500 bg-clip-text text-transparent">
                {" "}
                premium style
              </span>
              -аар унш
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
              Гар утас, таблет, компьютер гээд бүх төхөөрөмж дээр эвтэйхэн
              харагдах dark purple UI. Хайлт, genre filter, ranking, latest
              update бүгд нэг нүүрэнд цэгцтэй.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Comics
                </p>
                <p className="mt-2 text-2xl font-bold">{totalComics}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Genres
                </p>
                <p className="mt-2 text-2xl font-bold">{genres.length}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Chapters
                </p>
                <p className="mt-2 text-2xl font-bold">{totalChapters}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Popular
                </p>
                <p className="mt-2 text-2xl font-bold">{popularComics.length}</p>
              </div>
            </div>

            <form
              action="/"
              method="GET"
              className="mt-7 rounded-[26px] border border-white/10 bg-[#100b1d]/80 p-4"
            >
              {selectedGenre && (
                <input type="hidden" name="genre" value={selectedGenre} />
              )}

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Манга нэр, author, genre хайх..."
                  className="h-13 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-zinc-500"
                />

                <button className="h-13 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 hover:scale-[1.02]">
                  Хайх
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/"
                  className={`rounded-full px-3 py-2 text-xs font-medium ${
                    !selectedGenre
                      ? "bg-violet-600 text-white"
                      : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  Бүгд
                </Link>

                {genres.slice(0, 14).map((genre) => (
                  <Link
                    key={genre}
                    href={makeQueryLink(q, genre)}
                    className={`rounded-full px-3 py-2 text-xs font-medium ${
                      selectedGenre === genre
                        ? "bg-violet-600 text-white"
                        : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </form>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#latest"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40"
              >
                Уншиж эхлэх
              </Link>

              <Link
                href="#popular"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Popular харах
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
              Featured
            </p>

            {featuredComic ? (
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#120d20]">
                <div className="relative">
                  <img
                    src={featuredComic.coverImage}
                    alt={featuredComic.title}
                    className="h-72 w-full object-cover sm:h-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0816] via-[#0c0816]/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {[featuredComic.genre, featuredComic.genre2, featuredComic.genre3]
                        .filter(Boolean)
                        .map((genre) => (
                          <span
                            key={genre}
                            className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium text-white backdrop-blur"
                          >
                            {genre}
                          </span>
                        ))}
                    </div>

                    <h2 className="text-2xl font-extrabold text-white">
                      {featuredComic.title}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-300">
                      {featuredComic.author || "Unknown author"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-300">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {featuredComic.views} views
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {featuredComic.chapters.length} chapters
                      </span>
                      <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-violet-200">
                        Premium style
                      </span>
                    </div>

                    <Link
                      href={`/comic/${featuredComic.slug}`}
                      className="mt-5 inline-flex rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40"
                    >
                      Дэлгэрэнгүй
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-[#120d20] p-6 text-zinc-300">
                Одоогоор featured comic байхгүй байна.
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        id="popular"
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
              Ranking
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              Popular manga
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Уншсан тоогоор эрэмбэлсэн хамгийн алдартай manga
            </p>
          </div>
        </div>

        {popularComics.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-zinc-300 backdrop-blur-xl">
            Popular manga байхгүй байна.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {popularComics.map((comic, index) => {
              const comicGenres = [comic.genre, comic.genre2, comic.genre3].filter(
                Boolean
              );

              return (
                <Link
                  key={comic.id}
                  href={`/comic/${comic.slug}`}
                  className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-500/30"
                >
                  <div className="relative">
                    <img
                      src={comic.coverImage}
                      alt={comic.title}
                      className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <div className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      #{index + 1}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0814] to-transparent p-4">
                      <div className="flex flex-wrap gap-2">
                        {comicGenres.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] text-white"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-1 text-lg font-bold text-white">
                      {comic.title}
                    </h3>

                    <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
                      {comic.author || "Unknown author"}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-300">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {comic.views} views
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {comic.chapters.length} ch
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section
        id="latest"
        className="mx-auto max-w-7xl px-4 py-6 pb-14 sm:px-6 lg:px-8"
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
              Latest
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              {q || selectedGenre ? "Хайлтын үр дүн" : "Шинэ comic"}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              {q || selectedGenre
                ? "Чиний хайлт болон genre filter-ийн үр дүн"
                : "Сүүлд нэмэгдсэн manga, manhwa, comic"}
            </p>
          </div>

          {(q || selectedGenre) && (
            <div className="flex flex-wrap gap-2">
              {q && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                  Search: {q}
                </span>
              )}
              {selectedGenre && (
                <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
                  Genre: {selectedGenre}
                </span>
              )}
              <Link
                href="/"
                className="rounded-full bg-white/8 px-3 py-2 text-xs font-medium text-white hover:bg-white/12"
              >
                Цэвэрлэх
              </Link>
            </div>
          )}
        </div>

        {comics.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-zinc-300 backdrop-blur-xl">
            Comic олдсонгүй.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {comics.map((comic) => {
              const comicGenres = [comic.genre, comic.genre2, comic.genre3].filter(
                Boolean
              );

              return (
                <Link
                  key={comic.id}
                  href={`/comic/${comic.slug}`}
                  className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-500/30"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={comic.coverImage}
                      alt={comic.title}
                      className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <div className="absolute left-4 top-4 flex gap-2">
                      <span className="rounded-full border border-white/10 bg-[#0e0a17]/80 px-3 py-1 text-[11px] text-zinc-200 backdrop-blur">
                        {comic.chapters.length} ch
                      </span>
                      <span className="rounded-full border border-white/10 bg-[#0e0a17]/80 px-3 py-1 text-[11px] text-zinc-200 backdrop-blur">
                        {comic.views} views
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {comicGenres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-200"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    <h3 className="line-clamp-1 text-lg font-bold text-white">
                      {comic.title}
                    </h3>

                    <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
                      {comic.author || "Unknown author"}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-300">
                      {comic.description}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-200">
                      Дэлгэрэнгүй харах
                      <span>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}