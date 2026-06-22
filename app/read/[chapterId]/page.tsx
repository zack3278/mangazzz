/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ chapterId: string }> };

export default async function ReadPage({ params }: Props) {
  const { chapterId } = await params;
  const id = Number(chapterId);
  if (!Number.isFinite(id)) notFound();

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: { comic: true, images: { orderBy: { order: "asc" } } },
  });
  if (!chapter) notFound();

  const siblings = await prisma.chapter.findMany({
    where: { comicId: chapter.comicId },
    orderBy: { number: "asc" },
  });
  const index = siblings.findIndex((item) => item.id === chapter.id);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index < siblings.length - 1 ? siblings[index + 1] : null;

  return (
    <main className="min-h-screen bg-[#050409] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080711]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href={`/comic/${chapter.comic.slug}`} className="font-black">← {chapter.comic.title}</Link>
          <div className="hidden text-center sm:block"><p className="text-xs text-zinc-500">Chapter {chapter.number}</p><b>{chapter.title}</b></div>
          <div className="flex gap-2">
            {prev && <Link href={`/read/${prev.id}`} className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10">Prev</Link>}
            {next && <Link href={`/read/${next.id}`} className="rounded-xl bg-white px-3 py-2 text-sm font-black text-black">Next</Link>}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-2 py-6 sm:px-4">
        <div className="mb-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-300">Reading mode</p>
          <h1 className="mt-2 text-2xl font-black">Chapter {chapter.number}: {chapter.title}</h1>
        </div>

        {chapter.images.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-zinc-400">Энэ chapter дээр зураг алга.</div>
        ) : (
          <div className="space-y-3">
            {chapter.images.map((image) => <img key={image.id} src={image.imageUrl} alt="chapter page" className="mx-auto w-full max-w-4xl rounded-lg bg-black" />)}
          </div>
        )}

        <div className="mt-8 flex justify-between gap-3">
          {prev ? <Link href={`/read/${prev.id}`} className="rounded-2xl border border-white/10 px-5 py-3 font-black hover:bg-white/10">← Prev</Link> : <span />}
          {next ? <Link href={`/read/${next.id}`} className="rounded-2xl bg-white px-5 py-3 font-black text-black">Next →</Link> : <Link href={`/comic/${chapter.comic.slug}`} className="rounded-2xl bg-white px-5 py-3 font-black text-black">Finish</Link>}
        </div>
      </section>
    </main>
  );
}
