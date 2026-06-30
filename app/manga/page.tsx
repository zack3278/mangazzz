/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    status?: string;
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

function statusText(status?: string | null) {
  if (status === "COMPLETED") return "Дууссан";
  return "Гарч байгаа";
}

function statusClass(status?: string | null) {
  if (status === "COMPLETED") return "bg-emerald-400 text-black";
  return "bg-yellow-400 text-black";
}

function makeHref(params: {
  q?: string;
  genre?: string;
  status?: string;
}) {
  const search = new URLSearchParams();

  if (params.q) search.set("q", params.q);
  if (params.genre) search.set("genre", params.genre);
  if (params.status) search.set("status", params.status);

  const qs = search.toString();

  return qs ? `/manga?${qs}` : "/manga";
}

export default async function MangaPage({ searchParams }: Props) {
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const selectedGenre = params.genre?.trim() || "";
  const selectedStatus = params.status?.trim() || "";

  const genreSource = await prisma.comic.findMany({
    select: {
      genre: true,
      genre2: true,
      genre3: true,
    },
  });

  const genres = Array.from(
    new Set(
      genreSource
        .flatMap((comic) => [comic.genre, comic.genre2, comic.genre3])
        .filter((genre): genre is string => Boolean(genre && genre.trim()))
    )
  ).sort();

  const filters: any[] = [];

  if (q) {
    filters.push({
      OR: [
        {
          title: {
            contains: q,
            mode: "insensitive" as const,
          },
        },
        {
          author: {
            contains: q,
            mode: "insensitive" as const,
          },
        },
        {
          genre: {
            contains: q,
            mode: "insensitive" as const,
          },
        },
        {
          genre2: {
            contains: q,
            mode: "insensitive" as const,
          },
        },
        {
          genre3: {
            contains: q,
            mode: "insensitive" as const,
          },
        },
      ],
    });
  }

  if (selectedGenre) {
    filters.push({
      OR: [
        { genre: selectedGenre },
        { genre2: selectedGenre },
        { genre3: selectedGenre },
      ],
    });
  }

  if (selectedStatus) {
    filters.push({
      status: selectedStatus,
    });
  }

  const comics = await prisma.comic.findMany({
    where: filters.length > 0 ? { AND: filters } : {},
    orderBy: {
      createdAt: "desc",
    },
    include: {
      chapters: {
        orderBy: {
          number: "asc",
        },
      },
    },
  });

  const activeFilterCount = [q, selectedGenre, selectedStatus].filter(
    Boolean
  ).length;

  return (
    <main className="min-h-screen bg-[#0b0a07] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.12),transparent_35%),linear-gradient(to_bottom,#0b0a07,#050505)]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] px-4 py-4">
        <Navbar />

        <section className="mt-6 rounded-[30px] border border-white/10 bg-[#11110f] p-5 shadow-2xl shadow-black/40 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                Manga library
              </p>

              <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
                Манганууд
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-zinc-400">
                Бүх manga жагсаалт. Зүүн талын genre болон status-аар цэгцтэй
                шүүж үзнэ.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
                Нийт
              </p>
              <p className="mt-1 text-3xl font-black text-yellow-300">
                {comics.length}
              </p>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                Идэвхтэй filter:
              </span>

              {q && (
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-zinc-200">
                  Хайлт: {q}
                </span>
              )}

              {selectedGenre && (
                <span className="rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-black text-black">
                  Genre: {selectedGenre}
                </span>
              )}

              {selectedStatus && (
                <span className="rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-black text-black">
                  Status: {statusText(selectedStatus)}
                </span>
              )}

              <Link
                href="/manga"
                className="rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-black text-red-300 hover:bg-red-500 hover:text-white"
              >
                Цэвэрлэх
              </Link>
            </div>
          )}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-[26px] border border-white/10 bg-[#11110f] p-4">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">
                Filter
              </p>

              <h2 className="mt-2 text-2xl font-black">Ангилал</h2>

              <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
                Genre болон status сонгоод manga-г шүүнэ.
              </p>
            </div>

            <details
              open
              className="rounded-[26px] border border-white/10 bg-[#11110f] p-4"
            >
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
                      Genre
                    </p>
                    <h3 className="mt-1 text-lg font-black">Бүх genre</h3>
                  </div>

                  <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                    {genres.length}
                  </span>
                </div>
              </summary>

              <div className="mt-4 max-h-[430px] space-y-2 overflow-y-auto pr-1">
                <Link
                  href={makeHref({
                    q,
                    status: selectedStatus,
                  })}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition ${
                    !selectedGenre
                      ? "bg-yellow-400 text-black"
                      : "bg-black/35 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <span>Бүгд</span>
                  <span>{genreSource.length}</span>
                </Link>

                {genres.map((genre) => (
                  <Link
                    key={genre}
                    href={makeHref({
                      q,
                      genre,
                      status: selectedStatus,
                    })}
                    className={`block rounded-2xl px-4 py-3 text-sm font-black transition ${
                      selectedGenre === genre
                        ? "bg-yellow-400 text-black"
                        : "bg-black/35 text-zinc-300 hover:bg-yellow-400 hover:text-black"
                    }`}
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </details>

            <details
              open
              className="rounded-[26px] border border-white/10 bg-[#11110f] p-4"
            >
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
                      Status
                    </p>
                    <h3 className="mt-1 text-lg font-black">Төлөв</h3>
                  </div>

                  <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                    2
                  </span>
                </div>
              </summary>

              <div className="mt-4 space-y-2">
                <Link
                  href={makeHref({
                    q,
                    genre: selectedGenre,
                  })}
                  className={`block rounded-2xl px-4 py-3 text-sm font-black transition ${
                    !selectedStatus
                      ? "bg-yellow-400 text-black"
                      : "bg-black/35 text-zinc-300 hover:bg-yellow-400 hover:text-black"
                  }`}
                >
                  Бүгд
                </Link>

                <Link
                  href={makeHref({
                    q,
                    genre: selectedGenre,
                    status: "ONGOING",
                  })}
                  className={`block rounded-2xl px-4 py-3 text-sm font-black transition ${
                    selectedStatus === "ONGOING"
                      ? "bg-yellow-400 text-black"
                      : "bg-black/35 text-zinc-300 hover:bg-yellow-400 hover:text-black"
                  }`}
                >
                  Гарч байгаа
                </Link>

                <Link
                  href={makeHref({
                    q,
                    genre: selectedGenre,
                    status: "COMPLETED",
                  })}
                  className={`block rounded-2xl px-4 py-3 text-sm font-black transition ${
                    selectedStatus === "COMPLETED"
                      ? "bg-yellow-400 text-black"
                      : "bg-black/35 text-zinc-300 hover:bg-yellow-400 hover:text-black"
                  }`}
                >
                  Дууссан
                </Link>
              </div>
            </details>
          </aside>

          <div className="rounded-[30px] border border-white/10 bg-[#11110f] p-5 md:p-7">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">
                  All manga
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {q
                    ? `"${q}" хайлтын үр дүн`
                    : selectedGenre
                    ? `${selectedGenre} manga`
                    : selectedStatus
                    ? statusText(selectedStatus)
                    : "Бүх manga"}
                </h2>

                <p className="mt-1 text-sm font-semibold text-zinc-500">
                  Нийт {comics.length} manga олдлоо.
                </p>
              </div>

              <Link
                href="/manga"
                className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black text-white hover:bg-yellow-400 hover:text-black"
              >
                Reset
              </Link>
            </div>

            {comics.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-10 text-center">
                <p className="text-sm font-bold text-zinc-400">
                  Manga олдсонгүй.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {comics.map((comic) => {
                  const firstChapter = comic.chapters[0];

                  return (
                    <article
                      key={comic.id}
                      className="group overflow-hidden rounded-[22px] border border-white/10 bg-black/35 transition hover:-translate-y-1 hover:border-yellow-400/50"
                    >
                      <Link href={`/comic/${comic.slug}`}>
                        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
                          <img
                            src={imageSrc(comic.coverImage)}
                            alt={comic.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />

                          <span
                            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black ${statusClass(
                              comic.status
                            )}`}
                          >
                            {statusText(comic.status)}
                          </span>
                        </div>
                      </Link>

                      <div className="p-3">
                        <Link href={`/comic/${comic.slug}`}>
                          <h3 className="line-clamp-2 min-h-10 text-sm font-black text-white group-hover:text-yellow-300">
                            {comic.title}
                          </h3>
                        </Link>

                        <p className="mt-1 text-xs font-semibold text-zinc-500">
                          {comic.chapters.length} chapter • {comic.views} views
                        </p>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {[comic.genre, comic.genre2, comic.genre3]
                            .filter(Boolean)
                            .slice(0, 3)
                            .map((genre) => (
                              <span
                                key={genre}
                                className="rounded-full bg-yellow-400/10 px-2 py-1 text-[10px] font-black text-yellow-300"
                              >
                                {genre}
                              </span>
                            ))}
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Link
                            href={`/comic/${comic.slug}`}
                            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-xs font-black hover:bg-yellow-400 hover:text-black"
                          >
                            Дэлгэрэнгүй
                          </Link>

                          {firstChapter && (
                            <Link
                              href={`/read/${firstChapter.id}`}
                              className="rounded-xl bg-yellow-400 px-3 py-2 text-xs font-black text-black hover:bg-yellow-300"
                            >
                              Унших
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}