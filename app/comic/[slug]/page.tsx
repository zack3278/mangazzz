/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import FavoriteButton from "@/components/FavoriteButton";

type Props = {
  params: Promise<{
    slug: string;
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

function StatusBadge({ status }: { status?: string | null }) {
  if (status === "COMPLETED") {
    return (
      <span className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-black text-black">
        COMPLETED
      </span>
    );
  }

  return (
    <span className="rounded-md bg-yellow-400 px-3 py-1 text-xs font-black text-black">
      ONGOING
    </span>
  );
}

export default async function ComicDetailPage({ params }: Props) {
  const { slug } = await params;

  const comic = await prisma.comic.findUnique({
    where: {
      slug,
    },
    include: {
      chapters: {
        orderBy: {
          number: "desc",
        },
        include: {
          images: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });

  if (!comic) notFound();

  const genres = [comic.genre, comic.genre2, comic.genre3].filter(Boolean);
  const firstChapter = comic.chapters[comic.chapters.length - 1];

  return (
    <main className="site-shell min-h-screen text-white">
      <Navbar />

      <section className="container-soft py-10">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] shadow-2xl">
          <div className="relative min-h-[260px] border-b border-white/10 p-5 md:p-8">
            {comic.bannerImage && (
              <img
                src={imageSrc(comic.bannerImage)}
                alt={comic.title}
                className="absolute inset-0 h-full w-full object-cover opacity-25"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/50" />

            <div className="relative grid gap-7 md:grid-cols-[210px_1fr]">
              <div className="flex justify-center md:justify-start">
                <div className="rounded-2xl border border-white/10 bg-black p-3">
                  <img
                    src={imageSrc(comic.coverImage)}
                    alt={comic.title}
                    className="h-[300px] w-[200px] rounded-xl object-contain"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-yellow-400/15 px-3 py-1 text-xs font-black text-yellow-300">
                    Series
                  </span>

                  <StatusBadge status={comic.status} />
                </div>

                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                  {comic.title}
                </h1>

                <p className="mt-4 max-w-3xl whitespace-pre-line text-sm font-medium leading-7 text-zinc-300 md:text-base">
                  {comic.description || "Тайлбар байхгүй байна."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-md bg-yellow-400/15 px-3 py-1 text-xs font-black text-yellow-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  {firstChapter && (
                    <Link
                      href={`/read/${firstChapter.id}`}
                      className="rounded-xl bg-yellow-400 px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
                    >
                      Start reading
                    </Link>
                  )}

                  <FavoriteButton comicId={comic.id} />

                  <Link
                    href="/"
                    className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white transition hover:bg-white/10"
                  >
                    Back home
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-3 md:p-8">
            <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
              <p className="text-xs font-bold text-zinc-500">Author</p>
              <h2 className="mt-2 text-xl font-black">
                {comic.author || "Unknown"}
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
              <p className="text-xs font-bold text-zinc-500">Views</p>
              <h2 className="mt-2 text-xl font-black">{comic.views}</h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
              <p className="text-xs font-bold text-zinc-500">Chapters</p>
              <h2 className="mt-2 text-xl font-black">
                {comic.chapters.length}
              </h2>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-3xl font-black">Chapter list</h2>

            <span className="rounded-md bg-white/10 px-3 py-1 text-xs font-black text-white">
              {comic.chapters.length} chapters
            </span>
          </div>

          {comic.chapters.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#121212] p-8 text-center font-bold text-zinc-400">
              Chapter байхгүй байна.
            </div>
          ) : (
            <div className="grid gap-3">
              {comic.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/read/${chapter.id}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#121212] p-4 transition hover:border-yellow-400/40 hover:bg-[#181818]"
                >
                  <div>
                    <h3 className="text-xl font-black">
                      Chapter {chapter.number}
                    </h3>

                    <p className="mt-1 text-sm font-bold text-zinc-500">
                      {chapter.title} • {chapter.images.length} pages
                    </p>
                  </div>

                  <span className="rounded-xl bg-yellow-400 px-4 py-2 text-xs font-black text-black transition group-hover:bg-yellow-300">
                    Read →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}