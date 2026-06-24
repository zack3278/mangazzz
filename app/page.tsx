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

function coverSrc(src?: string | null) {
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
    orderBy: { createdAt: "desc" },
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

  const heroComic = comics[0] || popularComics[0];

  return (
    <main className="site-shell text-white">
      <Navbar />

      <section className="container-soft py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="glass-panel overflow-hidden rounded-[2rem] p-6 md:p-10">
            <span className="badge badge-red">Mangazet Premium Reader</span>

            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              Manga, manhwa, webtoon-оо{" "}
              <span className="bg-gradient-to-r from-red-400 via-orange-300 to-purple-300 bg-clip-text text-transparent">
                premium style
              </span>
              -аар унш.
            </h1>

            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-zinc-300 md:text-lg">
              Шинэ chapter, premium lock, QPay төлбөр, editor upload бүгд нэг
              дор. Илүү цэвэр, хурдан, mobile дээр гоё харагдах UI.
            </p>

            <form
              action="/"
              className="mt-8 grid gap-3 rounded-3xl border border-white/10 bg-black/30 p-3 md:grid-cols-[1fr_auto]"
            >
              <input
                name="q"
                defaultValue={q}
                placeholder="Manga нэр, author, genre хайх..."
                className="soft-input"
              />
              <button className="primary-btn" type="submit">
                Хайх
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/"
                className={`badge ${!selectedGenre ? "badge-gold" : ""}`}
              >
                Бүгд
              </Link>

              {genres.slice(0, 12).map((genre) => (
                <Link
                  key={genre}
                  href={`/?genre=${encodeURIComponent(genre)}`}
                  className={`badge ${
                    selectedGenre === genre ? "badge-gold" : ""
                  }`}
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>

          <div className="glass-card overflow-hidden rounded-[2rem] p-4">
            {heroComic ? (
              <Link href={`/comic/${heroComic.slug}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-zinc-950">
                  <img
                    src={coverSrc(heroComic.coverImage)}
                    alt={heroComic.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="badge badge-gold">Featured</span>
                    <h2 className="mt-3 line-clamp-2 text-3xl font-black">
                      {heroComic.title}
                    </h2>
                    <p className="mt-2 text-sm font-bold text-zinc-300">
                      {heroComic.chapters.length} chapters • {heroComic.views}{" "}
                      views
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 text-center text-zinc-500">
                Manga нэмэгдээгүй байна
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-soft pb-14">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <span className="badge">Latest updates</span>
            <h2 className="mt-3 text-3xl font-black">
              {q || selectedGenre ? "Хайлтын үр дүн" : "Шинээр нэмэгдсэн manga"}
            </h2>
          </div>

          <p className="text-sm font-bold text-zinc-500">Нийт: {comics.length}</p>
        </div>

        {comics.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center">
            <h3 className="text-2xl font-black">Comic олдсонгүй</h3>
            <p className="mt-2 text-zinc-400">
              Хайлтын үгээ өөрчлөөд дахин оролдоно уу.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {comics.map((comic) => {
              const comicGenres = [comic.genre, comic.genre2, comic.genre3].filter(Boolean);

              return (
                <Link
                  key={comic.id}
                  href={`/comic/${comic.slug}`}
                  className="cover-card group"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-zinc-950">
                    <img
                      src={coverSrc(comic.coverImage)}
                      alt={comic.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-black text-white">
                      {comic.title}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs font-bold text-zinc-500">
                      {comic.author || "Unknown author"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {comicGenres.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="rounded-full bg-white/8 px-2 py-1 text-[10px] font-black text-red-200"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    <p className="mt-3 text-[11px] font-black text-zinc-400">
                      {comic.chapters.length} ch • {comic.views} views
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="container-soft pb-16">
        <div className="glass-panel rounded-[2rem] p-5 md:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="badge badge-gold">Ranking</span>
              <h2 className="mt-3 text-2xl font-black">Popular manga</h2>
            </div>
          </div>

          {popularComics.length === 0 ? (
            <p className="text-sm font-bold text-zinc-500">
              Ranking одоогоор хоосон байна.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {popularComics.map((comic, index) => (
                <Link
                  key={comic.id}
                  href={`/comic/${comic.slug}`}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-3 transition hover:bg-white/8"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-black">
                    #{index + 1}
                  </span>

                  <img
                    src={coverSrc(comic.coverImage)}
                    alt={comic.title}
                    className="h-16 w-12 rounded-xl object-cover"
                  />

                  <div className="min-w-0">
                    <h3 className="line-clamp-1 font-black">{comic.title}</h3>
                    <p className="mt-1 text-xs font-bold text-zinc-500">
                      {comic.views} views • {comic.chapters.length} chapters
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}