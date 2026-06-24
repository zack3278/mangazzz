/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import HomeHeroSlider from "@/components/HomeHeroSlider";

type Props = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
  }>;
};

function imageSrc(src?: string | null) {
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

function StatusBadge({ status }: { status?: string | null }) {
  if (status === "COMPLETED") {
    return (
      <span className="absolute left-3 top-3 rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-black text-black shadow-lg">
        COMPLETED
      </span>
    );
  }

  return (
    <span className="absolute left-3 top-3 rounded-md bg-yellow-400 px-2 py-1 text-[10px] font-black text-black shadow-lg">
      ONGOING
    </span>
  );
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
  });

  const trending = await prisma.comic.findMany({
    orderBy: {
      views: "desc",
    },
    take: 5,
    include: {
      chapters: true,
    },
  });

  const heroItems = comics.slice(0, 6).map((comic) => ({
    id: comic.id,
    title: comic.title,
    slug: comic.slug,
    description: comic.description,
    coverImage: comic.coverImage,
    bannerImage: comic.bannerImage,
    status: comic.status,
    chaptersCount: comic.chapters.length,
  }));

  const continueList = comics.slice(0, 12);

  return (
    <main className="min-h-screen bg-[#191713] p-2 text-white md:p-4">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-[1440px] overflow-hidden rounded-[22px] bg-[#070707] shadow-2xl">
        <Navbar />

        <section className="px-5 pb-10 md:px-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="mb-5 flex items-center gap-2 text-xl font-black text-yellow-400">
                <span>✣</span>
                <span>Шинэ</span>
              </div>

              <HomeHeroSlider items={heroItems} />
            </div>

            <aside>
              <div className="mb-5 flex items-center gap-2 text-xl font-black text-yellow-400">
                <span>✣</span>
                <span>Алдартай</span>
              </div>

              <div className="rounded-xl bg-[#171717] p-5">
                <div className="space-y-5">
                  {trending.length === 0 ? (
                    <p className="text-sm font-bold text-zinc-500">
                      Trending хоосон байна.
                    </p>
                  ) : (
                    trending.map((comic, index) => (
                      <Link
                        key={comic.id}
                        href={`/comic/${comic.slug}`}
                        className="grid grid-cols-[34px_54px_1fr] items-center gap-3 rounded-lg p-1 transition hover:bg-white/5"
                      >
                        <span className="text-xl font-black text-white">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <img
                          src={imageSrc(comic.coverImage)}
                          alt={comic.title}
                          className="h-[74px] w-[54px] rounded-md object-cover"
                        />

                        <div className="min-w-0">
                          <h3 className="line-clamp-1 text-sm font-black text-white">
                            {comic.title}
                          </h3>

                          <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-zinc-400">
                            <span>👁 {comic.views || 0}</span>
                            <span>♡ {comic.chapters.length}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>

          <Link
            href="/premium"
            className="group mt-10 block overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 text-black shadow-[0_20px_70px_rgba(250,204,21,0.18)] transition hover:brightness-105"
          >
            <div className="relative min-h-[170px] px-8 py-8 md:px-11">
              <div className="relative z-10 max-w-[620px]">
                <span className="inline-flex rounded-full bg-black/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">
                  Premium
                </span>

                <h2 className="mt-4 text-3xl font-black md:text-4xl">
                  PREMIUM ЭРХ АВАХ
                </h2>

                <p className="mt-3 text-sm font-black">
                  Premium эрхээ аваад хязгааргүй уншаарай.
                </p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-black px-7 py-3 text-sm font-black text-white shadow-[0_12px_35px_rgba(0,0,0,0.35)] transition group-hover:scale-105 group-hover:from-black group-hover:to-red-600">
                  Premium авах
                  <span className="text-lg leading-none">→</span>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 hidden h-full w-[46%] opacity-95 md:block">
                <div className="absolute bottom-0 right-8 flex items-end">
                  {trending.slice(0, 4).map((comic) => (
                    <img
                      key={comic.id}
                      src={imageSrc(comic.coverImage)}
                      alt={comic.title}
                      className="-ml-5 h-40 w-28 rounded-t-xl object-cover shadow-2xl transition group-hover:-translate-y-1"
                    />
                  ))}
                </div>
              </div>
            </div>
          </Link>

          <section className="mt-8">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  !selectedGenre
                    ? "bg-yellow-400 text-black"
                    : "bg-[#171717] text-zinc-300 hover:bg-[#222]"
                }`}
              >
                Бүгд
              </Link>

              {genres.map((genre) => (
                <Link
                  key={genre}
                  href={`/?genre=${encodeURIComponent(genre)}`}
                  className={`rounded-full px-4 py-2 text-xs font-black transition ${
                    selectedGenre === genre
                      ? "bg-yellow-400 text-black"
                      : "bg-[#171717] text-zinc-300 hover:bg-[#222]"
                  }`}
                >
                  {genre}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xl font-black text-yellow-400">
                <span>◴</span>
                <span>
                  {q
                    ? "Search Result"
                    : selectedGenre
                    ? `${selectedGenre} manga`
                    : "Continue Watching"}
                </span>
              </div>

              {(q || selectedGenre) && (
                <Link href="/" className="text-sm font-black text-zinc-400">
                  Clear
                </Link>
              )}
            </div>

            {continueList.length === 0 ? (
              <div className="rounded-xl bg-[#171717] p-10 text-center text-zinc-500">
                Manga олдсонгүй
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {continueList.map((comic) => (
                  <Link
                    key={comic.id}
                    href={`/comic/${comic.slug}`}
                    className="group overflow-hidden rounded-xl bg-[#151515] p-3 transition hover:-translate-y-1 hover:bg-[#202020]"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-900">
                      <img
                        src={imageSrc(comic.coverImage)}
                        alt={comic.title}
                        className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-110"
                      />

                      <StatusBadge status={comic.status} />
                    </div>

                    <h3 className="mt-3 line-clamp-1 text-sm font-black">
                      {comic.title}
                    </h3>

                    <p className="mt-1 text-xs font-bold text-zinc-500">
                      {comic.chapters.length} chapters • {comic.views} views
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}