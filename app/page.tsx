/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

type Props = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  const comics = await prisma.comic.findMany({
    where: q
      ? {
          OR: [
            {
              title: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              author: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              genre: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              genre2: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              genre3: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {},
    orderBy: {
      createdAt: "desc",
    },
    include: {
      chapters: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  const heroComics = await prisma.comic.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      chapters: true,
    },
  });

  const latestChapters = await prisma.chapter.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
    include: {
      comic: true,
    },
  });

  const latestComics = comics.slice(0, 12);
  const mainHero = heroComics[0] || null;
  const sideHeroes = heroComics.slice(1, 5);

  return (
    <main className="min-h-screen text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {mainHero ? (
          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <Link
              href={`/comic/${mainHero.slug}`}
              className="group relative min-h-[520px] overflow-hidden rounded-[36px] border border-white/10 bg-white/5 shadow-2xl shadow-black/40"
            >
              <img
                src={mainHero.coverImage}
                alt={mainHero.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#05020b] via-[#05020b]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#05020b]/85 via-[#05020b]/25 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <div className="mb-4 flex flex-wrap gap-2">
                  {[mainHero.genre, mainHero.genre2, mainHero.genre3]
                    .filter(Boolean)
                    .map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full bg-violet-600/85 px-3 py-1 text-xs font-bold text-white backdrop-blur"
                      >
                        {genre}
                      </span>
                    ))}
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
                  {mainHero.title}
                </h1>

                <p className="mt-4 max-w-2xl line-clamp-3 text-sm leading-7 text-zinc-200 sm:text-base">
                  {mainHero.description}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <span className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/40">
                    Уншиж эхлэх
                  </span>

                  <span className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur">
                    {mainHero.chapters.length} chapters
                  </span>

                  <span className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur">
                    {mainHero.views} views
                  </span>
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              {sideHeroes.length > 0 ? (
                sideHeroes.map((comic) => (
                  <Link
                    key={comic.id}
                    href={`/comic/${comic.slug}`}
                    className="group relative min-h-[250px] overflow-hidden rounded-[30px] border border-white/10 bg-white/5 shadow-xl shadow-black/30"
                  >
                    <img
                      src={comic.coverImage}
                      alt={comic.title}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#05020b] via-[#05020b]/45 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="mb-2 flex flex-wrap gap-2">
                        {[comic.genre, comic.genre2, comic.genre3]
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((genre) => (
                            <span
                              key={genre}
                              className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur"
                            >
                              {genre}
                            </span>
                          ))}
                      </div>

                      <h2 className="line-clamp-2 text-lg font-black text-white">
                        {comic.title}
                      </h2>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-2 flex min-h-[250px] items-center justify-center rounded-[30px] border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-zinc-400 lg:col-span-1">
                  Илүү олон manga нэмэхэд энд cover-ууд гарна.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[520px] items-center justify-center rounded-[36px] border border-dashed border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30">
            <div>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl font-black">
                M
              </div>

              <h1 className="mt-6 text-4xl font-black sm:text-6xl">
                Manga cover энд гарна
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
                Одоогоор database дээр manga байхгүй байна. Admin panel-ээс
                manga нэмэхэд энэ хэсэг том cover banner болж автоматаар
                харагдана.
              </p>

              <Link
                href="/admin"
                className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white"
              >
                Admin panel рүү очих
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-300">
              Manga
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {q ? "Хайлтын үр дүн" : "Манганууд"}
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              {q
                ? `"${q}" хайлтын илэрц`
                : "Сүүлд нэмэгдсэн manga, manhwa, comic"}
            </p>
          </div>

          {q && (
            <Link
              href="/"
              className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Хайлтыг цэвэрлэх
            </Link>
          )}
        </div>

        {latestComics.length === 0 ? (
          <div className="rounded-[30px] border border-dashed border-white/10 bg-white/5 p-10 text-center">
            <h3 className="text-2xl font-black text-white">Manga олдсонгүй</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Manga нэмэгдсэний дараа энэ хэсэг card-аар дүүрнэ.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestComics.map((comic) => (
              <Link
                key={comic.id}
                href={`/comic/${comic.slug}`}
                className="group overflow-hidden rounded-[30px] border border-white/10 bg-white/5 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-violet-500/40"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={comic.coverImage}
                    alt={comic.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#05020b] to-transparent p-4">
                    <div className="flex flex-wrap gap-2">
                      {[comic.genre, comic.genre2, comic.genre3]
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((genre) => (
                          <span
                            key={genre}
                            className="rounded-full bg-violet-600/85 px-2.5 py-1 text-[10px] font-bold text-white"
                          >
                            {genre}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="line-clamp-1 text-lg font-black text-white">
                    {comic.title}
                  </h3>

                  <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
                    {comic.author || "Unknown author"}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-300">
                    <span>{comic.views} views</span>
                    <span>{comic.chapters.length} ch</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-300">
            Latest update
          </p>

          <h2 className="mt-2 text-3xl font-black">Сүүлд орсон chapter</h2>

          <p className="mt-2 text-sm text-zinc-400">
            Хамгийн сүүлд нэмэгдсэн бүлгүүд
          </p>
        </div>

        {latestChapters.length === 0 ? (
          <div className="rounded-[30px] border border-dashed border-white/10 bg-white/5 p-10 text-center">
            <h3 className="text-2xl font-black text-white">
              Chapter байхгүй байна
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Chapter нэмэгдсэний дараа энд update жагсаалт гарна.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {latestChapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/read/${chapter.id}`}
                className="flex gap-4 rounded-[24px] border border-white/10 bg-white/5 p-3 transition hover:border-violet-500/40 hover:bg-white/10"
              >
                <img
                  src={chapter.comic.coverImage}
                  alt={chapter.comic.title}
                  className="h-24 w-[72px] rounded-2xl object-cover"
                />

                <div className="min-w-0 flex-1 py-1">
                  <h3 className="line-clamp-1 text-base font-black text-white">
                    {chapter.comic.title}
                  </h3>

                  <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
                    Chapter {chapter.number}: {chapter.title}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
                      Унших
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                      {chapter.comic.genre}
                    </span>
                  </div>
                </div>

                <div className="flex items-center pr-2 text-violet-200">→</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}