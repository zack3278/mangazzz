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
                { title: { contains: q, mode: "insensitive" } },
                { author: { contains: q, mode: "insensitive" } },
                { genre: { contains: q, mode: "insensitive" } },
                { genre2: { contains: q, mode: "insensitive" } },
                { genre3: { contains: q, mode: "insensitive" } },
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
    take: 12,
  });

  const popularComics = await prisma.comic.findMany({
    orderBy: {
      views: "desc",
    },
    include: {
      chapters: true,
    },
    take: 6,
  });

  const totalComics = await prisma.comic.count();
  const totalViews = popularComics.reduce((sum, comic) => sum + comic.views, 0);
  const totalChapters = comics.reduce(
    (sum, comic) => sum + comic.chapters.length,
    0
  );
  const featuredComic = popularComics[0] || comics[0] || null;

  return (
    <main className="min-h-screen text-white">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute left-[-120px] top-10 h-72 w-72 rounded-full bg-violet-700/20 blur-3xl" />
          <div className="absolute right-[-120px] top-24 h-72 w-72 rounded-full bg-fuchsia-700/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
              <div className="inline-flex rounded-full border border-violet-400/15 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-200">
                Clean Manga Platform
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Манга, манхва, комикоо
                <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  {" "}
                  цэвэрхэн
                </span>
                , гоё интерфейстэй унш
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                Илүү minimal, илүү premium мэдрэмжтэй, гар утсанд эвтэйхэн
                интерфейс. Хайлт, genre filter, ranking, latest comic бүгд
                цэгцтэй.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#latest"
                  className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30"
                >
                  Уншиж эхлэх
                </Link>

                <Link
                  href="#popular"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Popular үзэх
                </Link>
              </div>

              <form
                action="/"
                method="GET"
                className="mt-8 rounded-[28px] border border-white/10 bg-[#120c1d]/90 p-4"
              >
                {selectedGenre && (
                  <input type="hidden" name="genre" value={selectedGenre} />
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    placeholder="Манга нэр, author, genre хайх..."
                    className="h-14 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500"
                  />

                  <button className="h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-950/30">
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

                  {genres.slice(0, 10).map((genre) => (
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
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Comics
                  </p>
                  <p className="mt-3 text-3xl font-black">{totalComics}</p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Genres
                  </p>
                  <p className="mt-3 text-3xl font-black">{genres.length}</p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Chapters
                  </p>
                  <p className="mt-3 text-3xl font-black">{totalChapters}</p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Views
                  </p>
                  <p className="mt-3 text-3xl font-black">{totalViews}</p>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
                      Featured
                    </p>
                    <h2 className="mt-2 text-2xl font-black">Онцлох comic</h2>
                  </div>
                </div>

                {featuredComic ? (
                  <Link
                    href={`/comic/${featuredComic.slug}`}
                    className="block overflow-hidden rounded-[24px] border border-white/10 bg-[#120c1d]"
                  >
                    <img
                      src={featuredComic.coverImage}
                      alt={featuredComic.title}
                      className="h-64 w-full object-cover"
                    />

                    <div className="p-5">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {[featuredComic.genre, featuredComic.genre2, featuredComic.genre3]
                          .filter(Boolean)
                          .map((genre) => (
                            <span
                              key={genre}
                              className="rounded-full bg-violet-500/10 px-3 py-1 text-[11px] text-violet-200"
                            >
                              {genre}
                            </span>
                          ))}
                      </div>

                      <h3 className="text-xl font-bold text-white">
                        {featuredComic.title}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-400">
                        {featuredComic.author || "Unknown author"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-300">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                          {featuredComic.views} views
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                          {featuredComic.chapters.length} chapters
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-[#120c1d] p-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
                      ✦
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-white">
                      Одоогоор comic байхгүй
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      Admin panel-ээс comic нэмсний дараа featured хэсэг энд
                      гоё харагдана.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="popular"
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
            Ranking
          </p>
          <h2 className="mt-2 text-3xl font-black">Popular manga</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Хамгийн их үзэлттэй comic-ууд
          </p>
        </div>

        {popularComics.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white">
              Popular comic байхгүй байна
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Comic нэмэгдэж эхэлмэгц ranking хэсэг автоматаар дүүрнэ.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                      className="h-80 w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <div className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-xs font-bold text-white">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {comicGenres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="rounded-full bg-violet-500/10 px-3 py-1 text-[11px] text-violet-200"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xl font-bold text-white">
                      {comic.title}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      {comic.author || "Unknown author"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-300">
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
            <h2 className="mt-2 text-3xl font-black">
              {q || selectedGenre ? "Хайлтын үр дүн" : "Шинэ comic"}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              {q || selectedGenre
                ? "Хайлт болон genre filter-ийн үр дүн"
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
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10"
              >
                Цэвэрлэх
              </Link>
            </div>
          )}
        </div>

        {comics.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white">
              Comic олдсонгүй
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Хайлтын үгээ өөрчлөөд дахин оролдоно уу.
            </p>
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
                  <div className="relative">
                    <img
                      src={comic.coverImage}
                      alt={comic.title}
                      className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0814] to-transparent p-4">
                      <div className="flex flex-wrap gap-2">
                        {comicGenres.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white">
                      {comic.title}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      {comic.author || "Unknown author"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-300">
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
    </main>
  );
}