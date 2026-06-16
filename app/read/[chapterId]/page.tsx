import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

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
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/40">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-3xl">
            🔒
          </div>

          <h1 className="text-3xl font-black">Login шаардлагатай</h1>

          <p className="mt-3 leading-6 text-zinc-400">
            Manga уншихын тулд эхлээд account-аараа нэвтрэх хэрэгтэй.
          </p>

          <Link
            href="/login"
            className="mt-6 block rounded-2xl bg-red-600 py-4 font-bold shadow-lg shadow-red-600/30 hover:bg-red-700"
          >
            Login хийх
          </Link>

          <Link
            href="/"
            className="mt-3 block rounded-2xl border border-white/10 bg-white/5 py-4 font-bold hover:bg-white/10"
          >
            Нүүр рүү буцах
          </Link>
        </div>
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
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="w-full max-w-md rounded-[2rem] border border-yellow-500/20 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/40">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500 text-3xl">
            👑
          </div>

          <h1 className="text-3xl font-black">Premium эрх шаардлагатай</h1>

          <p className="mt-3 leading-6 text-zinc-400">
            Энэ manga/chapter-ийг зөвхөн premium эрхтэй хэрэглэгч уншина.
          </p>

          <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            Premium эрхийг admin panel дээрээс тухайн user-д өгнө.
          </div>

          <Link
            href="/"
            className="mt-6 block rounded-2xl bg-red-600 py-4 font-bold shadow-lg shadow-red-600/30 hover:bg-red-700"
          >
            Нүүр рүү буцах
          </Link>
        </div>
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
    <main className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <Link
            href={`/comic/${chapter.comic.slug}`}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
          >
            ← Буцах
          </Link>

          <div className="min-w-0 text-center">
            <h1 className="truncate text-sm font-bold md:text-base">
              {chapter.comic.title}
            </h1>
            <p className="truncate text-xs text-zinc-400">
              Chapter {chapter.number}: {chapter.title}
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold shadow-lg shadow-red-600/30 hover:bg-red-700"
          >
            Home
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-3 py-5">
        <div className="mb-5 rounded-3xl border border-white/10 bg-zinc-950 p-4">
          <div className="grid grid-cols-3 items-center gap-3">
            {prevChapter ? (
              <Link
                href={`/read/${prevChapter.id}`}
                className="rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-semibold hover:bg-white/20"
              >
                ← Өмнөх
              </Link>
            ) : (
              <span className="rounded-2xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-600">
                ← Өмнөх
              </span>
            )}

            <Link
              href={`/comic/${chapter.comic.slug}`}
              className="rounded-2xl bg-white/5 px-4 py-3 text-center text-sm font-semibold hover:bg-white/10"
            >
              Chapter list
            </Link>

            {nextChapter ? (
              <Link
                href={`/read/${nextChapter.id}`}
                className="rounded-2xl bg-red-600 px-4 py-3 text-center text-sm font-semibold shadow-lg shadow-red-600/30 hover:bg-red-700"
              >
                Дараах →
              </Link>
            ) : (
              <span className="rounded-2xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-600">
                Дараах →
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400">
            <span className="rounded-full bg-white/5 px-3 py-1">
              {chapter.images.length} pages
            </span>

            <span className="rounded-full bg-white/5 px-3 py-1">
              {currentIndex + 1} / {chapters.length} chapter
            </span>

            <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-300">
              👑 Premium
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-zinc-950">
          {chapter.images.length === 0 ? (
            <div className="p-10 text-center text-zinc-400">
              Энэ chapter зураггүй байна.
            </div>
          ) : (
            chapter.images.map((image) => (
              <img
                key={image.id}
                src={image.imageUrl}
                alt="chapter image"
                className="mx-auto w-full"
              />
            ))
          )}
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-zinc-950 p-4">
          <div className="grid grid-cols-3 items-center gap-3">
            {prevChapter ? (
              <Link
                href={`/read/${prevChapter.id}`}
                className="rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-semibold hover:bg-white/20"
              >
                ← Өмнөх
              </Link>
            ) : (
              <span className="rounded-2xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-600">
                ← Өмнөх
              </span>
            )}

            <Link
              href={`/comic/${chapter.comic.slug}`}
              className="rounded-2xl bg-white/5 px-4 py-3 text-center text-sm font-semibold hover:bg-white/10"
            >
              Chapter list
            </Link>

            {nextChapter ? (
              <Link
                href={`/read/${nextChapter.id}`}
                className="rounded-2xl bg-red-600 px-4 py-3 text-center text-sm font-semibold shadow-lg shadow-red-600/30 hover:bg-red-700"
              >
                Дараах →
              </Link>
            ) : (
              <span className="rounded-2xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-600">
                Дараах →
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}