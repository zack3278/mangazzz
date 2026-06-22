import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function getImageSrc(src: string) {
  const clean = src.trim();

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  if (clean.startsWith("/")) {
    return clean;
  }

  return `/${clean}`;
}

export default async function ReadChapterPage({ params }: Props) {
  const { id } = await params;
  const chapterId = Number(id);

  if (!chapterId || Number.isNaN(chapterId)) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?next=/read/${chapterId}`);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      id: true,
      isPremium: true,
      premiumExpiresAt: true,
    },
  });

  if (!user) {
    redirect(`/login?next=/read/${chapterId}`);
  }

  const premiumExpired =
    user.isPremium &&
    user.premiumExpiresAt !== null &&
    new Date(user.premiumExpiresAt).getTime() <= Date.now();

  if (premiumExpired) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isPremium: false,
        premiumExpiresAt: null,
      },
    });

    redirect("/premium");
  }

  if (!user.isPremium) {
    redirect("/premium");
  }

  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
    include: {
      comic: true,
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

  const previousChapter = await prisma.chapter.findFirst({
    where: {
      comicId: chapter.comicId,
      number: {
        lt: chapter.number,
      },
    },
    orderBy: {
      number: "desc",
    },
    select: {
      id: true,
      number: true,
      title: true,
    },
  });

  const nextChapter = await prisma.chapter.findFirst({
    where: {
      comicId: chapter.comicId,
      number: {
        gt: chapter.number,
      },
    },
    orderBy: {
      number: "asc",
    },
    select: {
      id: true,
      number: true,
      title: true,
    },
  });

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

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-3 py-5 sm:px-4">
        <div className="mb-4 rounded-2xl border border-white/10 bg-[#090909] p-4">
          <Link
            href={`/comic/${chapter.comic.slug}`}
            className="text-sm font-bold text-red-400 hover:text-red-300"
          >
            ← {chapter.comic.title}
          </Link>

          <h1 className="mt-3 text-xl font-black sm:text-2xl">
            Chapter {chapter.number}: {chapter.title}
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            {chapter.images.length} pages
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {previousChapter ? (
              <Link
                href={`/read/${previousChapter.id}`}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-red-600"
              >
                ← Өмнөх chapter
                <span className="mt-1 block text-xs font-medium text-zinc-400">
                  Chapter {previousChapter.number}: {previousChapter.title}
                </span>
              </Link>
            ) : (
              <div className="rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-sm font-bold text-zinc-600">
                ← Өмнөх chapter байхгүй
              </div>
            )}

            {nextChapter ? (
              <Link
                href={`/read/${nextChapter.id}`}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-red-600 sm:text-right"
              >
                Дараагийн chapter →
                <span className="mt-1 block text-xs font-medium text-zinc-400">
                  Chapter {nextChapter.number}: {nextChapter.title}
                </span>
              </Link>
            ) : (
              <div className="rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-sm font-bold text-zinc-600 sm:text-right">
                Дараагийн chapter байхгүй →
              </div>
            )}
          </div>
        </div>

        {chapter.images.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#090909] p-10 text-center text-zinc-400">
            Энэ chapter дээр зураг байхгүй байна.
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col items-center">
            {chapter.images.map((image) => (
              <img
                key={image.id}
                src={getImageSrc(image.imageUrl)}
                alt={`Page ${image.order}`}
                className="h-auto w-full max-w-full select-none"
                loading="lazy"
              />
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-[#090909] p-4 sm:grid-cols-2">
          {previousChapter ? (
            <Link
              href={`/read/${previousChapter.id}`}
              className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white hover:bg-red-600"
            >
              ← Өмнөх chapter
            </Link>
          ) : (
            <div className="rounded-xl bg-zinc-900/50 px-4 py-3 text-sm font-bold text-zinc-600">
              ← Өмнөх chapter байхгүй
            </div>
          )}

          {nextChapter ? (
            <Link
              href={`/read/${nextChapter.id}`}
              className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white hover:bg-red-600 sm:text-right"
            >
              Дараагийн chapter →
            </Link>
          ) : (
            <div className="rounded-xl bg-zinc-900/50 px-4 py-3 text-sm font-bold text-zinc-600 sm:text-right">
              Дараагийн chapter байхгүй →
            </div>
          )}
        </div>
      </section>
    </main>
  );
}