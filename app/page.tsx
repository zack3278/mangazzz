import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

type Props = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
  }>;
};

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
                {
                  genre: selectedGenre,
                },
                {
                  genre2: selectedGenre,
                },
                {
                  genre3: selectedGenre,
                },
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
    take: 10,
    include: {
      chapters: true,
    },
  });

  return (
    <main className="min-h-screen text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 p-8 shadow-2xl shadow-black/50 md:p-12">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              Манга, Манхва, Комик
            </div>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Хязгааргүй унш
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
              Premium эрх авсанаар бүх гаргалтыг унших боломжтой. 👑
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#search"
                className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-red-600/30 hover:bg-red-700"
              >
                Manga хайх
              </a>

              <a
                href="#popular"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                Popular харах
              </a>

              <a
                href="#latest"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                Уншиж эхлэх
              </a>
            </div>
          </div>
        </div>

        <section
          id="search"
          className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6"
        >
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
              Search
            </p>

            <h2 className="mt-2 text-2xl font-black">Manga хайх</h2>

            <p className="mt-2 text-sm text-zinc-400">
              Нэр, author эсвэл genre оруулаад хайж болно.
            </p>
          </div>

          <form className="grid gap-4 md:grid-cols-[1fr_260px_140px]">
            <input
              name="q"
              defaultValue={q}
              placeholder="Нэр, author, genre хайх..."
              className="rounded-2xl border border-white/10 bg-zinc-900 px-5 py-4 outline-none focus:border-red-500"
            />

            <select
              name="genre"
              defaultValue={selectedGenre}
              className="rounded-2xl border border-white/10 bg-zinc-900 px-5 py-4 outline-none focus:border-red-500"
            >
              <option value="">Бүх genre</option>

              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>

            <button className="rounded-2xl bg-red-600 px-5 py-4 font-bold shadow-lg shadow-red-600/30 hover:bg-red-700">
              Хайх
            </button>
          </form>

          {(q || selectedGenre) && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-sm text-zinc-400">
                Олдсон:{" "}
                <span className="font-bold text-white">{comics.length}</span>
              </p>

              {q && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-zinc-300">
                  Search: {q}
                </span>
              )}

              {selectedGenre && (
                <span className="rounded-full bg-red-600/20 px-3 py-1 text-sm text-red-300">
                  Genre: {selectedGenre}
                </span>
              )}

              <Link
                href="/"
                className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                Цэвэрлэх
              </Link>
            </div>
          )}
        </section>

        <section id="popular" className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
                Ranking
              </p>

              <h2 className="text-2xl font-black">Popular manga</h2>
            </div>

            <p className="hidden text-sm text-zinc-500 md:block">
              Уншсан тоогоор эрэмбэлсэн
            </p>
          </div>

          {popularComics.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-2xl">
                🏆
              </div>

              <h3 className="text-xl font-bold">Popular manga байхгүй байна</h3>

              <p className="mt-2 text-zinc-400">
                Manga уншигдаж эхлэхээр ranking автоматаар гарна.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {popularComics.map((comic, index) => {
                const comicGenres = [comic.genre, comic.genre2, comic.genre3].filter(
                  Boolean
                );

                return (
                  <Link
                    key={comic.id}
                    href={`/comic/${comic.slug}`}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-xl shadow-black/20 hover:-translate-y-1 hover:border-red-500/40 hover:bg-white/[0.06]"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-zinc-900">
                      <img
                        src={comic.coverImage}
                        alt={comic.title}
                        className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      <div className="absolute left-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-sm font-black shadow-lg shadow-red-600/40">
                        #{index + 1}
                      </div>

                      <div className="absolute bottom-2 right-2 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold backdrop-blur">
                        {comic.views} views
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="line-clamp-1 font-bold group-hover:text-red-300">
                        {comic.title}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                        {comic.author || "Unknown author"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {comicGenres.map((genre) => (
                          <span
                            key={genre}
                            className="rounded-full bg-red-600/20 px-2 py-1 text-xs text-red-300"
                          >
                            {genre}
                          </span>
                        ))}

                        <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-zinc-300">
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

        <section id="latest" className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
                Latest
              </p>

              <h2 className="text-2xl font-black">
                {q || selectedGenre ? "Хайлтын үр дүн" : "Шинэ comic"}
              </h2>
            </div>
          </div>

          {comics.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-2xl">
                📚
              </div>

              <h3 className="text-xl font-bold">Comic олдсонгүй</h3>

              <p className="mt-2 text-zinc-400">
                Хайлтын үгээ өөрчлөөд дахин оролдоно уу.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-6">
              {comics.map((comic) => {
                const comicGenres = [comic.genre, comic.genre2, comic.genre3].filter(
                  Boolean
                );

                return (
                  <Link
                    key={comic.id}
                    href={`/comic/${comic.slug}`}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 p-3 shadow-xl shadow-black/20 hover:-translate-y-1 hover:border-red-500/40"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-zinc-900">
                      <img
                        src={comic.coverImage}
                        alt={comic.title}
                        className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      <div className="absolute left-2 top-2 rounded-full bg-black/70 px-3 py-1 text-xs backdrop-blur">
                        {comic.chapters.length} ch
                      </div>

                      <div className="absolute bottom-2 right-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold backdrop-blur">
                        {comic.views} views
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {comicGenres.map((genre) => (
                        <span
                          key={genre}
                          className="rounded-full bg-red-600/20 px-2 py-1 text-xs text-red-300"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    <h3 className="mt-2 line-clamp-1 font-bold">
                      {comic.title}
                    </h3>

                    <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
                      {comic.author || "Unknown author"}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}