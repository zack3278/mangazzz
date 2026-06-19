/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ComicDetailPage({ params }: Props) {
  const { slug } = await params;

  const comic = await prisma.comic.findUnique({
    where: {
      slug,
    },
    include: {
      chapters: {
        orderBy: {
          number: "asc",
        },
      },
    },
  });

  if (!comic) {
    notFound();
  }

  const comicGenres = [comic.genre, comic.genre2, comic.genre3].filter(Boolean);

  return (
    <main className="min-h-screen text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <img
              src={comic.coverImage}
              alt={comic.title}
              className="h-[420px] w-full rounded-[22px] object-cover"
            />
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-200">
                {comic.status}
              </span>

              {comicGenres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200"
                >
                  {genre}
                </span>
              ))}

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
                {comic.views} views
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
                {comic.chapters.length} chapters
              </span>
            </div>

            <h1 className="text-3xl font-black leading-tight text-white sm:text-5xl">
              {comic.title}
            </h1>

            <p className="mt-3 text-sm text-zinc-400 sm:text-base">
              Author: {comic.author || "Unknown"}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={
                  comic.chapters.length > 0
                    ? `/chapter/${comic.chapters[0].id}`
                    : "#"
                }
                className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold ${
                  comic.chapters.length > 0
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-950/40"
                    : "cursor-not-allowed border border-white/10 bg-white/5 text-zinc-500"
                }`}
              >
                {comic.chapters.length > 0 ? "Эхнээс нь унших" : "Chapter байхгүй"}
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Буцах
              </Link>
            </div>

            <div className="mt-8 rounded-[24px] border border-white/10 bg-[#110c1d]/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
                Тайлбар
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-300 sm:text-base">
                {comic.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
                Chapters
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                Бүх бүлгүүд
              </h2>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
              Нийт {comic.chapters.length} chapter
            </span>
          </div>

          {comic.chapters.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-[#110c1d]/80 p-6 text-zinc-300">
              Chapter байхгүй байна.
            </div>
          ) : (
            <div className="space-y-3">
              {comic.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/chapter/${chapter.id}`}
                  className="flex flex-col gap-3 rounded-[22px] border border-white/10 bg-[#110c1d]/80 p-4 transition hover:border-violet-500/30 hover:bg-[#161025] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-lg font-bold text-white">
                      Chapter {chapter.number}: {chapter.title}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Уншихад бэлэн
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200">
                    Унших
                    <span>→</span>
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