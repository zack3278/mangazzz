/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import HomeHeroSlider from "@/components/HomeHeroSlider";

type Props = {
  searchParams: Promise<{
    q?: string;
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
      <span className="absolute left-3 top-3 rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-black text-black">
        COMPLETED
      </span>
    );
  }

  return (
    <span className="absolute left-3 top-3 rounded-md bg-yellow-400 px-2 py-1 text-[10px] font-black text-black">
      ONGOING
    </span>
  );
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

  const hero = comics[0] || trending[0];
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
                <span>New</span>
              </div>

              <HomeHeroSlider items={heroItems} />
            </div>

            <aside>
              <div className="mb-5 flex items-center gap-2 text-xl font-black text-yellow-400">
                <span>✣</span>
                <span>Trending</span>
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
                        className="grid grid-cols-[34px_54px_1fr] items-center gap-3"
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

          <section className="mt-10 overflow-hidden rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 text-black">
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
                    className="rounded-md border-2 border-black px-6 py-3 text-sm font-black text-black transition hover:bg-black hover:text-white"
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

              <div className="absolute bottom-0 right-0 hidden h-full w-[46%] opacity-95 md:block">
                <div className="absolute bottom-0 right-8 flex items-end">
                  {trending.slice(0, 4).map((comic) => (
                    <img
                      key={comic.id}
                      src={imageSrc(comic.coverImage)}
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