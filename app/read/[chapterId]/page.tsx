/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type Props = {
  params: Promise<{
    chapterId: string;
  }>;
};

export default async function ReadChapterPage({ params }: Props) {
  const { chapterId } = await params;

  const tokenUser = await getCurrentUser();

  if (!tokenUser) {
    return (
      <main className="min-h-screen bg-[#090511] text-white">
        <Navbar />

        <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
              Login required
            </p>

            <h1 className="mt-5 text-3xl font-black">Login шаардлагатай</h1>

            <p className="mt-3 text-zinc-400">
              Manga уншихын тулд эхлээд account-аараа нэвтрэх хэрэгтэй.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 font-bold text-white"
              >
                Login хийх
              </Link>

              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white"
              >
                Нүүр рүү буцах
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: tokenUser.id,
    },
    select: {
      id: true,
      isPremium: true,
      role: true,
    },
  });

  if (!dbUser || !dbUser.isPremium) {
    return (
      <main className="min-h-screen bg-[#090511] text-white">
        <Navbar />

        <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
              Premium required
            </p>

            <h1 className="mt-5 text-3xl font-black">
              Premium эрх шаардлагатай
            </h1>

            <p className="mt-3 text-zinc-400">
              Энэ manga/chapter-ийг зөвхөн premium эрхтэй хэрэглэгч уншина.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/premium"
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 font-bold text-white"
              >
                Premium авах
              </Link>

              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white"
              >
                Нүүр рүү буцах
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const chapter = await prisma.chapter.findUnique({
    where: {
      id: Number(chapterId),
    },
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
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!chapter) {
    notFound();
  }

  await prisma.comic.update({
    where: {
      id: chapter.comicId,
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  const chapters = chapter.comic.chapters;
  const currentIndex = chapters.findIndex((item) => item.id === chapter.id);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <main className="min-h-screen bg-[#05030b] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090511]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link
            href={`/comic/${chapter.comic.slug}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            ← Буцах
          </Link>

          <div className="min-w-0 text-center">
            <h1 className="truncate text-sm font-bold sm:text-base">
              {chapter.comic.title}
            </h1>
            <p className="truncate text-xs text-zinc-400">
              Chapter {chapter.number}: {chapter.title}
            </p>
          </div>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-3 py-5 sm:px-4">
        <div className="mb-5 rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200/80">
                Premium Reader
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Chapter {chapter.number}: {chapter.title}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                {chapter.images.length} pages
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                {currentIndex + 1} / {chapters.length} chapter
              </span>

              <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-200">
                Premium
              </span>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
          {prevChapter ? (
            <Link
              href={`/read/${prevChapter.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-sm font-semibold hover:bg-white/10"
            >
              ← Өмнөх
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-sm font-semibold text-zinc-600">
              ← Өмнөх
            </span>
          )}

          <Link
            href={`/comic/${chapter.comic.slug}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-sm font-semibold hover:bg-white/10"
          >
            Chapter list
          </Link>

          {nextChapter ? (
            <Link
              href={`/read/${nextChapter.id}`}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-3 text-center text-sm font-semibold"
            >
              Дараах →
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-sm font-semibold text-zinc-600">
              Дараах →
            </span>
          )}
        </div>

        {chapter.images.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
            Энэ chapter зураггүй байна.
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-3">
            {chapter.images.map((image) => (
              <img
                key={image.id}
                src={image.imageUrl}
                alt={`Page ${image.order}`}
                className="mx-auto w-full rounded-xl border border-white/5 bg-black object-contain shadow-xl shadow-black/30"
              />
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 gap-2">
          {prevChapter ? (
            <Link
              href={`/read/${prevChapter.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-sm font-semibold hover:bg-white/10"
            >
              ← Өмнөх
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-sm font-semibold text-zinc-600">
              ← Өмнөх
            </span>
          )}

          <Link
            href={`/comic/${chapter.comic.slug}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-sm font-semibold hover:bg-white/10"
          >
            Chapter list
          </Link>

          {nextChapter ? (
            <Link
              href={`/read/${nextChapter.id}`}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-3 text-center text-sm font-semibold"
            >
              Дараах →
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-sm font-semibold text-zinc-600">
              Дараах →
            </span>
          )}
        </div>
      </section>
    </main>
  );
}