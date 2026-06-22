/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

type Props = { params: Promise<{ slug: string }> };

export default async function ComicDetailPage({ params }: Props) {
  const { slug } = await params;
  const comic = await prisma.comic.findUnique({
    where: { slug },
    include: { chapters: { orderBy: { number: "desc" }, include: { images: { orderBy: { order: "asc" } } } } },
  });

  if (!comic) notFound();
  const genres = [comic.genre, comic.genre2, comic.genre3].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#080711] text-white">
      <Navbar />
      <section className="relative overflow-hidden">
        <img src={comic.coverImage} alt={comic.title} className="absolute inset-0 h-full w-full object-cover opacity-30 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#080711]/90 to-[#080711]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[320px_1fr] lg:py-16">
          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950 shadow-2xl shadow-black/50">
            <img src={comic.coverImage} alt={comic.title} className="aspect-[2/3] w-full object-cover" />
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-violet-300">Series</p>
            <h1 className="mt-3 text-5xl font-black leading-none md:text-7xl">{comic.title}</h1>
            <p className="mt-4 max-w-3xl text-zinc-300">{comic.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {genres.map((genre) => <span key={genre} className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold">{genre}</span>)}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {comic.chapters[0] && <Link href={`/read/${comic.chapters[0].id}`} className="rounded-2xl bg-white px-6 py-3 font-black text-black">Start reading</Link>}
              <Link href="/" className="rounded-2xl border border-white/10 px-6 py-3 font-black text-white hover:bg-white/10">Back home</Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-zinc-500">Author</p><b>{comic.author || "Unknown"}</b></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-zinc-500">Views</p><b>{comic.views}</b></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-zinc-500">Chapters</p><b>{comic.chapters.length}</b></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <h2 className="mb-4 text-2xl font-black">Chapter list</h2>
        <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
          {comic.chapters.length === 0 ? <p className="p-5 text-zinc-400">Chapter байхгүй байна.</p> : comic.chapters.map((chapter) => (
            <Link key={chapter.id} href={`/read/${chapter.id}`} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4 hover:border-violet-400/50 hover:bg-violet-500/10">
              <div>
                <h3 className="font-black group-hover:text-violet-200">Chapter {chapter.number}</h3>
                <p className="text-sm text-zinc-400">{chapter.title} • {chapter.images.length} pages</p>
              </div>
              <span className="text-violet-200">Read →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
