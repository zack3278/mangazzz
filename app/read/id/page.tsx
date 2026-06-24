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
        <div className="glass-panel max-w-lg rounded-[2rem] p-8 text-center">
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
    where: { id: tokenUser.id },
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
      where: { id: dbUser.id },
      data: {
        isPremium: false,
        premiumExpiresAt: null,
      },
    });
  }

  if (!dbUser || (!dbUser.isPremium && dbUser.role !== "ADMIN")) {
    return (
      <main className="site-shell flex min-h-screen items-center justify-center px-4 text-white">
        <div className="glass-panel max-w-lg rounded-[2rem] p-8 text-center">
          <span className="badge badge-gold">Premium required</span>

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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="container-soft flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href={`/comic/${chapter.comic.slug}`}
              className="text-sm font-black text-red-300 hover:text-red-200"
            >
              ← Буцах
            </Link>

            <h1 className="mt-1 line-clamp-1 text-xl font-black md:text-2xl">
              {chapter.comic.title}
            </h1>

            <p className="text-sm font-bold text-zinc-500">
              Chapter {chapter.number}: {chapter.title}
            </p>
          </div>

          <Link href="/" className="secondary-btn px-4 py-3 text-sm">
            Home
          </Link>
        </div>
      </header>

      <nav className="container-soft flex flex-wrap items-center justify-center gap-3 py-5">
        {prevChapter ? (
          <Link
            href={`/read/${prevChapter.id}`}
            className="secondary-btn px-4 py-3 text-sm"
          >
            ← Өмнөх
          </Link>
        ) : (
          <span className="secondary-btn px-4 py-3 text-sm opacity-40">
            ← Өмнөх
          </span>
        )}

        <Link
          href={`/comic/${chapter.comic.slug}`}
          className="secondary-btn px-4 py-3 text-sm"
        >
          Chapter list
        </Link>

        {nextChapter ? (
          <Link
            href={`/read/${nextChapter.id}`}
            className="primary-btn px-4 py-3 text-sm"
          >
            Дараах →
          </Link>
        ) : (
          <span className="secondary-btn px-4 py-3 text-sm opacity-40">
            Дараах →
          </span>
        )}
      </nav>

      <div className="container-soft mb-5 flex flex-wrap justify-center gap-2">
        <span className="badge">{chapter.images.length} pages</span>
        <span className="badge">
          {currentIndex + 1} / {chapters.length} chapter
        </span>
        <span className="badge badge-gold">Premium</span>
      </div>

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
              className="reader-image"
            />
          ))
        )}
      </section>

      <nav className="container-soft flex flex-wrap items-center justify-center gap-3 pb-10">
        {prevChapter ? (
          <Link
            href={`/read/${prevChapter.id}`}
            className="secondary-btn px-4 py-3 text-sm"
          >
            ← Өмнөх
          </Link>
        ) : (
          <span className="secondary-btn px-4 py-3 text-sm opacity-40">
            ← Өмнөх
          </span>
        )}

        <Link
          href={`/comic/${chapter.comic.slug}`}
          className="secondary-btn px-4 py-3 text-sm"
        >
          Chapter list
        </Link>

        {nextChapter ? (
          <Link
            href={`/read/${nextChapter.id}`}
            className="primary-btn px-4 py-3 text-sm"
          >
            Дараах →
          </Link>
        ) : (
          <span className="secondary-btn px-4 py-3 text-sm opacity-40">
            Дараах →
          </span>
        )}
      </nav>
    </main>
  );
}