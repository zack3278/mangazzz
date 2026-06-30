/* eslint-disable @next/next/no-img-element */

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{
    chapterId: string;
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

export default async function ReadChapterPage({ params }: Props) {
  const { chapterId } = await params;

  const tokenUser = await getCurrentUser();

  if (!tokenUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080a] px-4 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-[#111115] p-8 text-center">
          <h1 className="text-3xl font-black">Login шаардлагатай</h1>

          <p className="mt-3 text-sm font-semibold leading-7 text-zinc-400">
            Manga уншихын тулд эхлээд account-аараа нэвтрэх хэрэгтэй.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-black"
            >
              Login хийх
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black"
            >
              Нүүр рүү буцах
            </Link>
          </div>
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

  if (!dbUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080a] px-4 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-[#111115] p-8 text-center">
          <h1 className="text-3xl font-black">User олдсонгүй</h1>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-black"
          >
            Login хийх
          </Link>
        </div>
      </main>
    );
  }

  const hasAccess =
    dbUser.isPremium || dbUser.role === "ADMIN" || dbUser.role === "EDITOR";

  if (!hasAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080a] px-4 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-[#111115] p-8 text-center">
          <h1 className="text-3xl font-black">Premium эрх шаардлагатай</h1>

          <p className="mt-3 text-sm font-semibold leading-7 text-zinc-400">
            Энэ manga/chapter-ийг зөвхөн premium эрхтэй хэрэглэгч уншина.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/premium"
              className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-black"
            >
              Premium авах
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black"
            >
              Нүүр рүү буцах
            </Link>
          </div>
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

  await prisma.readingHistory.upsert({
    where: {
      userId_chapterId: {
        userId: dbUser.id,
        chapterId: chapter.id,
      },
    },
    update: {
      comicId: chapter.comicId,
      updatedAt: new Date(),
    },
    create: {
      userId: dbUser.id,
      comicId: chapter.comicId,
      chapterId: chapter.id,
    },
  });

  const chapters = chapter.comic.chapters;
  const currentIndex = chapters.findIndex((item) => item.id === chapter.id);

  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <main className="min-h-screen bg-[#08080a] text-white">
      <div className="mx-auto w-full max-w-[980px] px-4 py-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#111115] p-4">
          <Link
            href={`/comic/${chapter.comic.slug}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black hover:bg-yellow-400 hover:text-black"
          >
            ← Буцах
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-black">{chapter.comic.title}</h1>
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              Chapter {chapter.number}: {chapter.title}
            </p>
          </div>

          <Link
            href="/"
            className="rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-black text-black hover:bg-yellow-300"
          >
            Home
          </Link>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-3 rounded-3xl border border-white/10 bg-[#111115] p-4">
          {prevChapter ? (
            <Link
              href={`/read/${prevChapter.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black hover:bg-yellow-400 hover:text-black"
            >
              ← Өмнөх
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-zinc-600">
              ← Өмнөх
            </span>
          )}

          <Link
            href={`/comic/${chapter.comic.slug}`}
            className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black hover:bg-white/15"
          >
            Chapter list
          </Link>

          {nextChapter ? (
            <Link
              href={`/read/${nextChapter.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black hover:bg-yellow-400 hover:text-black"
            >
              Дараах →
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-zinc-600">
              Дараах →
            </span>
          )}
        </div>

        <div className="mb-5 flex flex-wrap justify-center gap-2 text-xs font-black">
          <span className="rounded-full bg-yellow-400 px-3 py-1 text-black">
            {chapter.images.length} pages
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1 text-zinc-300">
            {currentIndex + 1} / {chapters.length} chapter
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1 text-zinc-300">
            Premium
          </span>
        </div>

        {chapter.images.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#111115] p-10 text-center">
            <p className="text-sm font-bold text-zinc-400">
              Энэ chapter зураггүй байна.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chapter.images.map((image) => (
              <img
                key={image.id}
                src={imageSrc(image.imageUrl)}
                alt={`Page ${image.order}`}
                className="mx-auto w-full rounded-xl"
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 rounded-3xl border border-white/10 bg-[#111115] p-4">
          {prevChapter ? (
            <Link
              href={`/read/${prevChapter.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black hover:bg-yellow-400 hover:text-black"
            >
              ← Өмнөх
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-zinc-600">
              ← Өмнөх
            </span>
          )}

          <Link
            href={`/comic/${chapter.comic.slug}`}
            className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black hover:bg-white/15"
          >
            Chapter list
          </Link>

          {nextChapter ? (
            <Link
              href={`/read/${nextChapter.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black hover:bg-yellow-400 hover:text-black"
            >
              Дараах →
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-zinc-600">
              Дараах →
            </span>
          )}
        </div>
      </div>
    </main>
  );
}