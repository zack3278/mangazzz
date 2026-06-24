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

function imageSrc(src: string) {
  const clean = src.trim();

  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("/")
  ) {
    return clean;
  }

  return `/${clean}`;
}

export default async function ReadChapterPage({ params }: Props) {
  const { chapterId } = await params;

  const tokenUser = await getCurrentUser();

  if (!tokenUser) {
    return (
      <main className="site-shell flex min-h-screen items-center justify-center px-4 text-white">
        <div className="max-w-lg rounded-[2rem] border border-white/10 bg-[#111] p-8 text-center">
          <h1 className="text-3xl font-black">Login шаардлагатай</h1>

          <p className="mt-3 text-zinc-400">
            Manga уншихын тулд эхлээд account-аараа нэвтрэх хэрэгтэй.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="primary-btn">
              Login хийх
            </Link>
            <Link href="/" className="secondary-btn">
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
      premiumExpiresAt: true,
      role: true,
    },
  });

  const premiumExpired =
    dbUser?.isPremium &&
    dbUser.premiumExpiresAt !== null &&
    new Date(dbUser.premiumExpiresAt).getTime() <= Date.now();

  if (dbUser && premiumExpired) {
    await prisma.user.update({
      where: {
        id: dbUser.id,
      },
      data: {
        isPremium: false,
        premiumExpiresAt: null,
      },
    });
  }

  if (!dbUser || (!dbUser.isPremium && dbUser.role !== "ADMIN")) {
    return (
      <main className="site-shell flex min-h-screen items-center justify-center px-4 text-white">
        <div className="max-w-lg rounded-[2rem] border border-white/10 bg-[#111] p-8 text-center">
          <span className="rounded-md bg-yellow-400 px-3 py-1 text-xs font-black text-black">
            Premium required
          </span>

          <h1 className="mt-4 text-3xl font-black">
            Premium эрх шаардлагатай
          </h1>

          <p className="mt-3 text-zinc-400">
            Энэ manga/chapter-ийг зөвхөн premium эрхтэй хэрэглэгч уншина.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/premium" className="primary-btn">
              Premium авах
            </Link>
            <Link href="/" className="secondary-btn">
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

  if (!chapter) notFound();

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
      <header className="border-b border-white/10 bg-[#070707]">
        <div className="mx-auto flex max-w-[980px] flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href={`/comic/${chapter.comic.slug}`}
              className="text-sm font-black text-yellow-300 hover:text-yellow-200"
            >
              ← Буцах
            </Link>

            <h1 className="mt-2 line-clamp-2 text-xl font-black md:text-2xl">
              {chapter.comic.title}
            </h1>

            <p className="mt-1 text-sm font-bold text-zinc-500">
              Chapter {chapter.number}: {chapter.title}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              Home
            </Link>

            <Link
              href={`/comic/${chapter.comic.slug}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              Chapter list
            </Link>
          </div>
        </div>
      </header>

      <nav className="mx-auto flex max-w-[980px] flex-wrap items-center justify-center gap-3 px-4 py-5">
        {prevChapter ? (
          <Link
            href={`/read/${prevChapter.id}`}
            className="rounded-xl border border-white/10 bg-[#111] px-5 py-3 text-sm font-black text-white transition hover:bg-[#181818]"
          >
            ← Өмнөх
          </Link>
        ) : (
          <span className="rounded-xl border border-white/10 bg-[#111] px-5 py-3 text-sm font-black text-zinc-600">
            ← Өмнөх
          </span>
        )}

        <span className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-3 text-sm font-black text-yellow-300">
          {currentIndex + 1} / {chapters.length}
        </span>

        {nextChapter ? (
          <Link
            href={`/read/${nextChapter.id}`}
            className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
          >
            Дараах →
          </Link>
        ) : (
          <span className="rounded-xl border border-white/10 bg-[#111] px-5 py-3 text-sm font-black text-zinc-600">
            Дараах →
          </span>
        )}
      </nav>

      <section className="mx-auto max-w-[980px] pb-8">
        {chapter.images.length === 0 ? (
          <div className="mx-4 rounded-3xl border border-white/10 bg-white/5 p-10 text-center font-bold text-zinc-400">
            Энэ chapter зураггүй байна.
          </div>
        ) : (
          chapter.images.map((image) => (
            <img
              key={image.id}
              src={imageSrc(image.imageUrl)}
              alt={`Page ${image.order}`}
              className="mx-auto block w-full max-w-[900px] bg-black"
            />
          ))
        )}
      </section>

      <nav className="mx-auto flex max-w-[980px] flex-wrap items-center justify-center gap-3 px-4 pb-10">
        {prevChapter ? (
          <Link
            href={`/read/${prevChapter.id}`}
            className="rounded-xl border border-white/10 bg-[#111] px-5 py-3 text-sm font-black text-white transition hover:bg-[#181818]"
          >
            ← Өмнөх chapter
          </Link>
        ) : null}

        <Link
          href={`/comic/${chapter.comic.slug}`}
          className="rounded-xl border border-white/10 bg-[#111] px-5 py-3 text-sm font-black text-white transition hover:bg-[#181818]"
        >
          Chapter list
        </Link>

        {nextChapter ? (
          <Link
            href={`/read/${nextChapter.id}`}
            className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
          >
            Дараах chapter →
          </Link>
        ) : null}
      </nav>
    </main>
  );
}