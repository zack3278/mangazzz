/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

type Props = {
  params: Promise<{ slug: string }>;
};

function coverSrc(src?: string | null) {
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

export default async function ComicDetailPage({ params }: Props) {
  const { slug } = await params;

  const comic = await prisma.comic.findUnique({
    where: { slug },
    include: {
      chapters: {
        orderBy: { number: "desc" },
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

  return (
    <main className="site-shell min-h-screen text-white">
      <Navbar />

      <section className="container-soft py-10">
        <div className="glass-panel overflow-hidden rounded-[2rem] p-5 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
            <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-zinc-950">
              <img
                src={coverSrc(comic.coverImage)}
                alt={comic.title}
                className="aspect-[3/4] h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center">
              <span className="badge badge-red">Series</span>

              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                {comic.title}
              </h1>

              <p className="mt-5 max-w-3xl whitespace-pre-line text-base font-medium leading-8 text-zinc-300">
                {comic.description || "Тайлбар байхгүй байна."}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <span key={genre} className="badge badge-gold">
                    {genre}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {comic.chapters[0] && (
                  <Link
                    href={`/read/${comic.chapters[0].id}`}
                    className="primary-btn"
                  >
                    Start reading
                  </Link>
                )}

                <Link href="/" className="secondary-btn">
                  Back home
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="glass-card rounded-3xl p-6">
            <p className="text-sm font-bold text-zinc-500">Author</p>
            <h2 className="mt-2 text-2xl font-black">
              {comic.author || "Unknown"}
            </h2>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <p className="text-sm font-bold text-zinc-500">Views</p>
            <h2 className="mt-2 text-2xl font-black">{comic.views}</h2>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <p className="text-sm font-bold text-zinc-500">Chapters</p>
            <h2 className="mt-2 text-2xl font-black">{comic.chapters.length}</h2>
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-3xl font-black">Chapter list</h2>
            <span className="badge">{comic.chapters.length} chapters</span>
          </div>

          {comic.chapters.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 text-center font-bold text-zinc-400">
              Chapter байхгүй байна.
            </div>
          ) : (
            <div className="grid gap-3">
              {comic.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/read/${chapter.id}`}
                  className="glass-card flex items-center justify-between gap-4 rounded-3xl p-4 transition hover:border-red-400/40 hover:bg-white/8"
                >
                  <div>
                    <h3 className="text-xl font-black">
                      Chapter {chapter.number}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-zinc-500">
                      {chapter.title} • {chapter.images.length} pages
                    </p>
                  </div>

                  <span className="primary-btn hidden px-4 py-3 text-sm sm:inline-flex">
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