import Link from "next/link";
import { redirect, notFound } from "next/navigation";
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

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=/read/${chapterId}`);
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      role: true,
      isPremium: true,
      premiumExpiresAt: true,
    },
  });

  if (!dbUser) {
    redirect(`/login?next=/read/${chapterId}`);
  }

  const premiumExpired =
    dbUser.isPremium &&
    dbUser.premiumExpiresAt !== null &&
    new Date(dbUser.premiumExpiresAt).getTime() <= Date.now();

  if (premiumExpired) {
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

  const canRead =
    dbUser.role === "ADMIN" ||
    dbUser.role === "EDITOR" ||
    (dbUser.isPremium && !premiumExpired);

  if (!canRead) {
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

      <section className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 rounded-2xl border border-white/10 bg-zinc-950 p-4">
          <Link
            href={`/comic/${chapter.comic.slug}`}
            className="text-sm font-bold text-red-400 hover:text-red-300"
          >
            ← {chapter.comic.title}
          </Link>

          <h1 className="mt-3 text-2xl font-black">
            Chapter {chapter.number}: {chapter.title}
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            {chapter.images.length} pages
          </p>
        </div>

        {chapter.images.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-10 text-center text-zinc-400">
            Энэ chapter дээр зураг байхгүй байна.
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col items-center">
            {chapter.images.map((image) => (
              <img
                key={image.id}
                src={getImageSrc(image.imageUrl)}
                alt={`Page ${image.order}`}
                className="h-auto w-full max-w-full"
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}