/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

type Props = {
  searchParams: Promise<{
    q?: string;
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

  const comics = await prisma.comic.findMany({
    where: q
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
    orderBy: { createdAt: "desc" },
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

  const hero = comics[0] || trending[0];
  const continueList = comics.slice(0, 10);

  return (
    <main className="min-h-screen bg-[#191713] p-2 text-white md:p-4">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-[1440px] overflow-hidden rounded-[22px] bg-[#070707] shadow-2xl">
        <Navbar />

        <section className="px-5 pb-10 md:px-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="mb-5 flex items-center gap-2 text-xl font-black text-yellow-400">
                <span>✣</span>
                <span>New</span>
              </div>

              {hero ? (
                <Link
                  href={`/comic/${hero.slug}`}
                  className="group relative block h-[330px] overflow-hidden rounded-lg bg-zinc-900 md:h-[520px]"
                >
                  <img
                    src={coverSrc(hero.coverImage)}
                    alt={hero.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                  <div className="absolute bottom-10 left-8 max-w-[520px]">
                    <p className="mb-4 text-xs font-black text-white/80">
                      Home | TV
                    </p>

                    <h1 className="text-4xl font-black leading-tight md:text-5xl">
                      {hero.title}
                    </h1>

                    <p className="mt-4 text-sm font-black text-white/70">
                      EP {hero.chapters.length || 1} • 24m
                    </p>

                    <div className="mt-4 flex gap-2">
                      <span className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-black text-black">
                        SUB
                      </span>
                      <span className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-black text-black">
                        HD
                      </span>
                      <span className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-black text-black">
                        DUB
                      </span>
                    </div>

                    <p className="mt-5 line-clamp-3 max-w-[430px] text-sm font-medium leading-6 text-white/80">
                      {hero.description ||
                        "Premium manga унших боломжтой. Шинэ chapter, өндөр чанартай зураг, хурдан унших систем."}
                    </p>
                  </div>

                  <div className="absolute right-7 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-black text-black">
                    →
                  </div>

                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-400" />
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                  </div>
                </Link>
              ) : (
                <div className="flex h-[520px] items-center justify-center rounded-lg bg-zinc-900 text-zinc-500">
                  Manga нэмэгдээгүй байна
                </div>
              )}
            </div>

            <aside>
              <div className="mb-5 flex items-center gap-2 text-xl font-black text-yellow-400">
                <span>✣</span>
                <span>Trending</span>
              </div>

              <div className="rounded-lg bg-[#171717] p-5">
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
                        className="grid grid-cols-[34px_54px_1fr] items-center gap-3"
                      >
                        <span className="text-xl font-black text-white">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <img
                          src={coverSrc(comic.coverImage)}
                          alt={comic.title}
                          className="h-[70px] w-[54px] rounded object-cover"
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

          <section className="mt-10 overflow-hidden rounded-lg bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 text-black">
            <div className="relative min-h-[190px] px-8 py-8 md:px-11">
              <div className="relative z-10 max-w-[560px]">
                <h2 className="text-3xl font-black md:text-4xl">
                  READ MANGA ONLINE
                </h2>

                <p className="mt-3 text-sm font-black">
                  Highest Quality | No signups | No Ads
                </p>

                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href={hero ? `/comic/${hero.slug}` : "/"}
                    className="rounded bg-black px-6 py-3 text-sm font-black text-white"
                  >
                    Read Now
                  </Link>

                  <Link
                    href="/premium"
                    className="px-2 py-3 text-sm font-black underline"
                  >
                    Go to premium
                  </Link>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 hidden h-full w-[46%] opacity-90 md:block">
                <div className="absolute bottom-0 right-8 flex items-end gap-[-10px]">
                  {trending.slice(0, 4).map((comic) => (
                    <img
                      key={comic.id}
                      src={coverSrc(comic.coverImage)}
                      alt={comic.title}
                      className="-ml-5 h-40 w-28 rounded-t-xl object-cover shadow-2xl"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xl font-black text-yellow-400">
                <span>◴</span>
                <span>{q ? "Search Result" : "Continue Watching"}</span>
              </div>

              {q && (
                <Link href="/" className="text-sm font-black text-zinc-400">
                  Clear search
                </Link>
              )}
            </div>

            {continueList.length === 0 ? (
              <div className="rounded-lg bg-[#171717] p-10 text-center text-zinc-500">
                Manga олдсонгүй
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {continueList.map((comic) => (
                  <Link
                    key={comic.id}
                    href={`/comic/${comic.slug}`}
                    className="group overflow-hidden rounded-lg bg-[#151515] p-3 transition hover:-translate-y-1 hover:bg-[#202020]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-zinc-900">
                      <img
                        src={coverSrc(comic.coverImage)}
                        alt={comic.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />

                      <span className="absolute left-3 top-3 rounded bg-white px-2 py-1 text-[10px] font-black text-black">
                        SUB
                      </span>
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