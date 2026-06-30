import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function formatDate(date?: Date | string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function getInitial(name?: string | null, email?: string | null) {
  const value = name || email || "U";
  return value.charAt(0).toUpperCase();
}

function getComicCover(comic: any) {
  return (
    comic?.coverImage ||
    comic?.coverUrl ||
    comic?.image ||
    comic?.thumbnail ||
    "/placeholder-cover.png"
  );
}

function getComicHref(comic: any) {
  const slug = comic?.slug || comic?.id;
  return `/comic/${slug}`;
}

function getChapterHref(comic: any, chapter: any) {
  const slug = comic?.slug || comic?.id;
  return `/comic/${slug}/chapters/${chapter?.id}`;
}

export default async function ProfilePage() {
  const tokenUser = await getCurrentUser();

  if (!tokenUser) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: tokenUser.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isPremium: true,
      premiumExpiresAt: true,
      profileImage: true,
      favoriteMangas: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          comic: {
            include: {
              chapters: true,
            },
          },
        },
      },
      readingHistories: {
        take: 8,
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          comic: true,
          chapter: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const favoriteMangas = user.favoriteMangas.map((item) => item.comic);
  const readingHistories = user.readingHistories || [];

  return (
    <main className="min-h-screen bg-[#08080a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.1),transparent_35%),linear-gradient(to_bottom,#08080a,#050505)]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] px-4 py-4">
        <Navbar />

        <div className="mt-6 space-y-6">
          <section className="rounded-[30px] border border-white/10 bg-[#101013] p-5 shadow-2xl md:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-yellow-400/40 bg-gradient-to-br from-yellow-400/20 to-zinc-950 md:h-24 md:w-24">
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-black text-yellow-300">
                      {getInitial(user.name, user.email)}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-black text-black">
                      {user.isPremium ? "PREMIUM" : "FREE"}
                    </span>
                  </div>

                  <h1 className="truncate text-2xl font-black md:text-3xl">
                    {user.name || "Mangazet user"}
                  </h1>

                  <p className="mt-1 truncate text-sm text-zinc-400">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/profile/edit"
                  className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
                >
                  Profile засах
                </Link>

                <Link
                  href="/"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black transition hover:bg-white/10"
                >
                  Нүүр хуудас
                </Link>

                <Link
                  href="/comic"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black transition hover:bg-white/10"
                >
                  Manga үзэх
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-bold text-zinc-500">Premium</p>
                <p className="mt-2 text-lg font-black">
                  {user.isPremium ? "ACTIVE" : "INACTIVE"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-bold text-zinc-500">
                  Дуусах хугацаа
                </p>
                <p className="mt-2 text-lg font-black">
                  {user.isPremium ? formatDate(user.premiumExpiresAt) : "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-bold text-zinc-500">Дуртай manga</p>
                <p className="mt-2 text-lg font-black">
                  {favoriteMangas.length}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-[#101013] p-5 md:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Дуртай manga</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Heart дарсан manga энд харагдана.
                </p>
              </div>

              <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                {favoriteMangas.length}
              </span>
            </div>

            {favoriteMangas.length === 0 ? (
              <EmptyBox text="Дуртай manga байхгүй байна." />
            ) : (
              <MangaGrid comics={favoriteMangas} />
            )}
          </section>

          <section className="rounded-[30px] border border-white/10 bg-[#101013] p-5 md:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Сүүлд уншсан chapter</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Сүүлд уншсан chapter
                </p>
              </div>

              <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                {readingHistories.length}
              </span>
            </div>

            {readingHistories.length === 0 ? (
              <EmptyBox text="Сүүлд уншсан chapter байхгүй байна." />
            ) : (
              <div className="space-y-3">
                {readingHistories.map((item: any) => {
                  const comic = item.comic;
                  const chapter = item.chapter;
                  const title = comic?.title || "Untitled";
                  const cover = getComicCover(comic);

                  return (
                    <Link
                      key={item.id}
                      href={getChapterHref(comic, chapter)}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-yellow-400/50 hover:bg-yellow-400/5"
                    >
                      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                        <Image
                          src={cover}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black">
                          {title}
                        </h3>

                        <p className="mt-1 text-xs text-zinc-400">
                          Chapter {chapter?.chapterNumber || ""}
                          {chapter?.title ? ` - ${chapter.title}` : ""}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          {formatDate(item.updatedAt)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function MangaGrid({ comics }: { comics: any[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {comics.map((comic) => {
        const title = comic.title || "Untitled";
        const cover = getComicCover(comic);

        return (
          <Link
            key={comic.id}
            href={getComicHref(comic)}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-yellow-400/50 hover:bg-yellow-400/5"
          >
            <div className="relative aspect-[3/4] bg-zinc-900">
              <Image
                src={cover}
                alt={title}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </div>

            <div className="p-3">
              <h3 className="line-clamp-2 text-sm font-black">{title}</h3>
              <p className="mt-1 text-xs text-zinc-500">
                {comic.chapters?.length || 0} chapter
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
      <p className="text-sm font-bold text-zinc-400">{text}</p>
    </div>
  );
}