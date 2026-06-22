/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

function timeAgo(date?: Date | string | null) {
  if (!date) return "New";

  const d = new Date(date).getTime();
  const diff = Date.now() - d;
  const days = Math.max(0, Math.floor(diff / 86400000));

  if (days === 0) return "New";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function SmallCover({ comic }: { comic: any }) {
  const latest = comic.chapters?.[0];

  return (
    <Link href={`/comic/${comic.slug}`} className="group w-[118px] shrink-0">
      <div className="relative h-[178px] overflow-hidden rounded-md bg-zinc-900 shadow-[0_10px_30px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
        <img
          src={comic.coverImage || "/placeholder-cover.jpg"}
          alt={comic.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-2 pb-2 pt-8">
          <p className="line-clamp-2 text-[11px] font-black leading-tight text-white drop-shadow">
            {comic.title}
          </p>
        </div>
      </div>

      <p className="mt-1 line-clamp-1 text-center text-[10px] font-bold text-zinc-300">
        {latest ? `Chapter ${latest.number}` : "No chapters"}
      </p>
    </Link>
  );
}

function MangaBoxCard({ comic }: { comic: any }) {
  const chapters = comic.chapters || [];

  return (
    <div className="group overflow-hidden rounded-xl border border-white/10 bg-[#090909] shadow-[0_16px_40px_rgba(0,0,0,0.65)] transition hover:border-red-500/50 hover:bg-[#0c0c0c]">
      <div className="grid grid-cols-[96px_1fr]">
        <Link
          href={`/comic/${comic.slug}`}
          className="relative block min-h-[160px] overflow-hidden bg-zinc-900"
        >
          <img
            src={comic.coverImage || "/placeholder-cover.jpg"}
            alt={comic.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />

          <span className="absolute right-1 top-1 rounded bg-pink-500 px-1.5 py-0.5 text-[8px] font-black text-white">
            Manhwa
          </span>

          <span className="absolute bottom-1 left-1 rounded bg-black/80 px-1.5 py-0.5 text-[8px] font-black text-white">
            Pinned
          </span>
        </Link>

        <div className="flex min-w-0 flex-col p-3">
          <Link
            href={`/comic/${comic.slug}`}
            className="line-clamp-2 text-[14px] font-black leading-tight text-white hover:text-red-300"
          >
            {comic.title}
          </Link>

          <div className="mt-1 flex items-center gap-2 text-[10px] font-bold">
            <span className="text-yellow-400">
              ★ {(comic.rating || 9.4).toString()}
            </span>
            <span className="text-emerald-400">● Ongoing</span>
          </div>

          {comic.genre && (
            <p className="mt-1 line-clamp-1 text-[10px] font-semibold text-zinc-500">
              {comic.genre}
            </p>
          )}

          <div className="mt-auto space-y-1.5 pt-3">
            {chapters.slice(0, 3).map((chapter: any, index: number) => (
              <Link
                key={chapter.id}
                href={`/read/${chapter.id}`}
                className="flex items-center justify-between rounded-md border border-white/10 bg-black/60 px-2 py-1.5 text-[10px] font-black text-zinc-200 hover:border-red-500/50 hover:bg-red-500/10"
              >
                <span>Chapter {chapter.number}</span>
                <span className={index === 0 ? "text-zinc-300" : "text-zinc-500"}>
                  {index === 0 ? "New" : timeAgo(chapter.createdAt)}
                </span>
              </Link>
            ))}

            {chapters.length === 0 && (
              <div className="rounded-md border border-white/10 bg-black/60 px-2 py-2 text-[10px] font-bold text-zinc-500">
                No chapters yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChapterRow({ chapter }: { chapter: any }) {
  return (
    <Link
      href={`/read/${chapter.id}`}
      className="grid grid-cols-[54px_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-[#0a0a0a] p-2 transition hover:border-red-500/50 hover:bg-red-500/10"
    >
      <img
        src={chapter.comic.coverImage || "/placeholder-cover.jpg"}
        alt={chapter.comic.title}
        className="h-16 w-12 rounded object-cover"
      />

      <div className="min-w-0">
        <p className="line-clamp-1 text-xs font-black text-white">
          {chapter.comic.title}
        </p>
        <p className="mt-1 text-[11px] font-bold text-zinc-400">
          Chapter {chapter.number}: {chapter.title}
        </p>
      </div>

      <span className="rounded-full bg-red-600 px-2 py-1 text-[10px] font-black text-white">
        Read
      </span>
    </Link>
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
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: q ? 30 : 24,
    include: {
      chapters: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  const popular = await prisma.comic.findMany({
    orderBy: { views: "desc" },
    take: 18,
    include: {
      chapters: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  const latestFeed = await prisma.comic.findMany({
    orderBy: [{ createdAt: "desc" }, { views: "desc" }],
    take: 30,
    include: {
      chapters: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  const latestChapters = await prisma.chapter.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      comic: true,
    },
  });

  const topRow = q ? comics : popular;
  const gridComics = q ? comics : latestFeed;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020202] text-white">
      <Navbar />

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(127,29,29,0.25),transparent_34%),linear-gradient(180deg,#050505,#020202_42%,#060000)]" />
      <div className="pointer-events-none fixed bottom-0 right-0 -z-10 h-[70vh] w-[1px] bg-red-700/80 shadow-[0_0_24px_6px_rgba(220,38,38,0.35)]" />

      <section className="mt-4 w-full">
        <div className="mb-3 flex items-center gap-2 px-2 sm:px-6">
          <span className="text-xs text-white">✿</span>
          <h2 className="text-sm font-black text-white">Popular Today</h2>
        </div>

        {topRow.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto px-2 pb-3 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {topRow.map((comic: any) => (
              <SmallCover key={comic.id} comic={comic} />
            ))}
          </div>
        ) : (
          <div className="mx-3 rounded-xl border border-white/10 bg-[#090909] p-6 text-center text-sm font-bold text-zinc-500">
            Manga байхгүй байна.
          </div>
        )}
      </section>

      <section className="mx-auto mt-6 max-w-[1500px] px-3 pb-12 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-black text-white">
              {q ? `Search: ${q}` : "Latest Releases"}
            </h2>

            <span className="rounded-md border border-red-500/40 bg-red-600/10 px-3 py-1 text-[10px] font-black text-red-400">
              ♨ Hot
            </span>

            <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black text-zinc-400">
              ◎ New
            </span>
          </div>

          <Link
            href="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm text-zinc-400 hover:border-red-500 hover:text-white"
          >
            ↗
          </Link>
        </div>

        {gridComics.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {gridComics.map((comic: any) => (
              <MangaBoxCard key={comic.id} comic={comic} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-[#090909] p-8 text-center text-sm font-bold text-zinc-500">
            Илэрц олдсонгүй.
          </div>
        )}

        {latestChapters.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 text-base font-black text-white">
              Recent Chapter Updates
            </h3>

            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {latestChapters.map((chapter: any) => (
                <ChapterRow key={chapter.id} chapter={chapter} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}