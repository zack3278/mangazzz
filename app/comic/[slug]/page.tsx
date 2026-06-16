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

  return (
    <main className="min-h-screen text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <div>
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/70 p-3 shadow-2xl shadow-black/40">
              <img
                src={comic.coverImage}
                alt={comic.title}
                className="h-[460px] w-full rounded-[1.5rem] object-cover"
              />
            </div>

            <Link
              href={comic.chapters[0] ? `/read/${comic.chapters[0].id}` : "#"}
              className={`mt-5 block rounded-2xl px-5 py-4 text-center font-bold ${
                comic.chapters.length > 0
                  ? "bg-red-600 shadow-lg shadow-red-600/30 hover:bg-red-700"
                  : "cursor-not-allowed bg-zinc-800 text-zinc-400"
              }`}
            >
              {comic.chapters.length > 0 ? "Эхнээс нь унших" : "Chapter байхгүй"}
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-6 md:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold">
                {comic.status}
              </span>

              <Link
                href={`/?genre=${encodeURIComponent(comic.genre)}#latest`}
                className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-semibold text-yellow-300 hover:bg-yellow-500/30"
              >
                {comic.genre}
              </Link>

              <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-zinc-300">
                {comic.views} views
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-zinc-300">
                {comic.chapters.length} chapters
              </span>
            </div>

            <h1 className="text-4xl font-black md:text-5xl">{comic.title}</h1>

            <p className="mt-3 text-zinc-400">
              Author: {comic.author || "Unknown"}
            </p>

            <div className="mt-6 rounded-2xl bg-white/[0.03] p-5">
              <h2 className="mb-3 text-lg font-bold">Тайлбар</h2>
              <p className="leading-7 text-zinc-300">{comic.description}</p>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black">Chapters</h2>
              </div>

              {comic.chapters.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-zinc-400">
                  Chapter байхгүй байна.
                </div>
              ) : (
                <div className="space-y-3">
                  {comic.chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/read/${chapter.id}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 hover:border-red-500/40 hover:bg-white/[0.06]"
                    >
                      <div>
                        <p className="font-bold">
                          Chapter {chapter.number}: {chapter.title}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">Унших</p>
                      </div>

                      <span className="rounded-full bg-red-600/20 px-3 py-1 text-sm text-red-300">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}