/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import HomeHeroSlider from "@/components/HomeHeroSlider";
import { getCurrentUser } from "@/lib/auth";

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

function statusText(status?: string | null) {
  if (status === "COMPLETED") return "COMPLETED";
  return "ONGOING";
}

function StatusBadge({ status }: { status?: string | null }) {
  return (
    <span className="inline-flex rounded-md bg-yellow-400 px-3 py-1 text-[10px] font-black text-black">
      {statusText(status)}
    </span>
  );
}

function formatDate(date?: Date | string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export default async function HomePage() {
  const tokenUser = await getCurrentUser();

  const latestComics = await prisma.comic.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
    include: {
      chapters: {
        orderBy: {
          number: "asc",
        },
      },
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

  const readingHistories = tokenUser
    ? await prisma.readingHistory.findMany({
        where: {
          userId: tokenUser.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 30,
        include: {
          comic: {
            include: {
              chapters: {
                orderBy: {
                  number: "asc",
                },
              },
            },
          },
          chapter: true,
        },
      })
    : [];

  const seenComicIds = new Set<number>();

  const continueList = readingHistories
    .filter((item) => {
      if (seenComicIds.has(item.comicId)) return false;
      seenComicIds.add(item.comicId);
      return true;
    })
    .map((item) => ({
      ...item.comic,
      lastChapter: item.chapter,
      lastReadAt: item.updatedAt,
    }))
    .slice(0, 12);

  const heroItems = latestComics.slice(0, 6).map((comic) => ({
    id: comic.id,
    title: comic.title,
    slug: comic.slug,
    description: comic.description,
    coverImage: comic.coverImage,
    bannerImage: comic.bannerImage,
    status: comic.status,
    chaptersCount: comic.chapters.length,
  }));

  return (
    <main className="min-h-screen bg-[#0b0a07] text-white">
      <div className="relative mx-auto w-full max-w-[1180px] bg-black px-4 py-4 shadow-2xl shadow-black/60">
        <Navbar />

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_310px]">
          <div>
            <h2 className="mb-4 text-2xl font-black text-yellow-400">
              ✣ Шинэ
            </h2>

            <HomeHeroSlider items={heroItems} />
          </div>

          <aside>
            <h2 className="mb-4 text-2xl font-black text-yellow-400">
              ✣ Алдартай
            </h2>

            <div className="rounded-2xl bg-[#141414] p-5">
              {trending.length === 0 ? (
                <p className="text-sm font-bold text-zinc-500">
                  Trending хоосон байна.
                </p>
              ) : (
                <div className="space-y-5">
                  {trending.slice(0, 3).map((comic, index) => (
                    <Link
                      key={comic.id}
                      href={`/comic/${comic.slug}`}
                      className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.04]"
                    >
                      <span className="w-9 text-xl font-black">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <img
                        src={imageSrc(comic.coverImage)}
                        alt={comic.title}
                        className="h-16 w-12 rounded-lg object-cover"
                      />

                      <div className="min-w-0">
                        <h3 className="line-clamp-1 text-sm font-black">
                          {comic.title}
                        </h3>

                        <p className="mt-1 text-xs text-zinc-500">
                          👁 {comic.views || 0} ♡ {comic.chapters.length}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500">
          <div className="grid min-h-[230px] gap-4 p-7 text-black md:grid-cols-[1fr_310px] md:items-center">
            <div>
              <span className="rounded-full bg-black/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em]">
                Premium
              </span>

              <h2 className="mt-5 text-4xl font-black text-white">
                PREMIUM ЭРХ АВАХ
              </h2>

              <p className="mt-3 text-sm font-bold text-white">
                Premium эрхээ аваад хязгааргүй уншаарай.
              </p>

              <Link
                href="/premium"
                className="mt-6 inline-flex rounded-full bg-gradient-to-r from-red-700 to-black px-7 py-3 text-sm font-black text-white transition hover:scale-105"
              >
                Premium авах →
              </Link>
            </div>

            <div className="hidden items-end justify-end md:flex">
              <div className="flex -space-x-3">
                {trending.slice(0, 3).map((comic) => (
                  <img
                    key={comic.id}
                    src={imageSrc(comic.coverImage)}
                    alt={comic.title}
                    className="h-36 w-24 rounded-xl object-cover shadow-2xl"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-yellow-400">
                ◴ Continue Watching
              </h2>

              <p className="mt-1 text-sm font-semibold text-zinc-500">
                Зөвхөн сүүлд уншсан manga-ууд энд харагдана.
              </p>
            </div>

            <Link
              href="/manga"
              className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-black text-black hover:bg-yellow-300"
            >
              Бүх manga
            </Link>
          </div>

          {!tokenUser ? (
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-10 text-center">
              <p className="text-sm font-bold text-zinc-400">
                Continue Watching харахын тулд эхлээд нэвтэрнэ үү.
              </p>

              <Link
                href="/login"
                className="mt-4 inline-flex rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-black"
              >
                Нэвтрэх
              </Link>
            </div>
          ) : continueList.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-10 text-center">
              <p className="text-sm font-bold text-zinc-400">
                Сүүлд уншсан manga одоогоор байхгүй байна.
              </p>

              <Link
                href="/manga"
                className="mt-4 inline-flex rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-black"
              >
                Manga үзэх
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {continueList.map((comic: any) => {
                const lastChapter = comic.lastChapter;
                const href = lastChapter
                  ? `/read/${lastChapter.id}`
                  : `/comic/${comic.slug}`;

                return (
                  <article
                    key={comic.id}
                    className="group overflow-hidden rounded-2xl bg-[#141414] transition hover:-translate-y-1"
                  >
                    <Link href={href}>
                      <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl bg-zinc-900">
                        <img
                          src={imageSrc(comic.coverImage)}
                          alt={comic.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />

                        <div className="absolute left-3 top-3">
                          <StatusBadge status={comic.status} />
                        </div>
                      </div>
                    </Link>

                    <div className="p-3">
                      <Link href={href}>
                        <h3 className="line-clamp-2 text-sm font-black group-hover:text-yellow-300">
                          {comic.title}
                        </h3>
                      </Link>

                      <p className="mt-1 text-xs font-semibold text-zinc-500">
                        Chapter {lastChapter?.number || ""} •{" "}
                        {formatDate(comic.lastReadAt)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}