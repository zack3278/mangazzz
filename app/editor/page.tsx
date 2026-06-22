"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type Comic = { id: number; title: string; slug: string; coverImage: string; genre: string; genre2?: string | null; genre3?: string | null; chapters: { id: number; title: string; number: number }[] };

const genreOptions = ["Тулаант", "Романс", "Фантази", "Инээдэм", "Драма", "Аймшиг", "Адал Явдал", "Солонгос", "Япон", "Хятад", "Isekai", "Мурим", "Түүхэн", "Спорт", "Бусад"];

export default function EditorPage() {
  const [checking, setChecking] = useState(true);
  const [comics, setComics] = useState<Comic[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Бусад");
  const [genre2, setGenre2] = useState("");
  const [genre3, setGenre3] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [comicId, setComicId] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [images, setImages] = useState<string[]>([]);

  async function loadComics() {
    const res = await fetch("/api/comics");
    const data = await res.json();
    setComics(Array.isArray(data) ? data : data.comics || []);
  }

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.user || !["EDITOR", "ADMIN"].includes(data.user.role)) {
          window.location.href = "/login";
          return;
        }
        await loadComics();
      } finally {
        setChecking(false);
      }
    }
    check();
  }, []);

  async function upload(file: File | null, type: "cover" | "chapter") {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Upload алдаа");
    if (type === "cover") setCoverImage(data.url);
    else setImages((prev) => [...prev, data.url]);
  }

  async function addComic(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/comics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, author, description, coverImage, genre, genre2, genre3 }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Comic нэмэхэд алдаа");
    setTitle(""); setSlug(""); setAuthor(""); setDescription(""); setCoverImage(""); setGenre("Бусад"); setGenre2(""); setGenre3("");
    await loadComics();
  }

  async function addChapter(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comicId: Number(comicId), title: chapterTitle, number: Number(chapterNumber), images }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Chapter нэмэхэд алдаа");
    setComicId(""); setChapterTitle(""); setChapterNumber(""); setImages([]);
    await loadComics();
  }

  if (checking) return <main className="grid min-h-screen place-items-center bg-[#080711] text-white">Шалгаж байна...</main>;

  return (
    <main className="min-h-screen bg-[#080711] text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.05] p-7">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-violet-300">Editor studio</p>
          <h1 className="mt-2 text-4xl font-black">Series & Chapter нэмэх</h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={addComic} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 space-y-4">
            <h2 className="text-2xl font-black">Шинэ manga</h2>
            <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input className="input" placeholder="slug-example" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            <input className="input" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
            <textarea className="input min-h-28" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <div className="grid gap-3 md:grid-cols-3">
              {[genre, genre2, genre3].map((value, index) => (
                <select key={index} className="input" value={value} onChange={(e) => [setGenre, setGenre2, setGenre3][index](e.target.value)}>
                  {index > 0 && <option value="">Хоосон</option>}
                  {genreOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              ))}
            </div>
            <input className="input" type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0] || null, "cover")} />
            {coverImage && <img src={coverImage} alt="cover" className="h-44 rounded-2xl object-cover" />}
            <button className="w-full rounded-2xl bg-white py-3 font-black text-black">Comic нэмэх</button>
          </form>

          <form onSubmit={addChapter} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 space-y-4">
            <h2 className="text-2xl font-black">Шинэ chapter</h2>
            <select className="input" value={comicId} onChange={(e) => setComicId(e.target.value)} required>
              <option value="">Comic сонгох</option>
              {comics.map((comic) => <option key={comic.id} value={comic.id}>{comic.title}</option>)}
            </select>
            <input className="input" placeholder="Chapter title" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} required />
            <input className="input" type="number" placeholder="Chapter number" value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} required />
            <input className="input" type="file" accept="image/*" multiple onChange={async (e) => { for (const file of Array.from(e.target.files || [])) await upload(file, "chapter"); }} />
            <div className="grid grid-cols-4 gap-2">{images.map((src) => <img key={src} src={src} alt="page" className="aspect-[2/3] rounded-xl object-cover" />)}</div>
            <button className="w-full rounded-2xl bg-white py-3 font-black text-black">Chapter нэмэх</button>
          </form>
        </div>

        <div className="mt-8 grid gap-3">
          {comics.map((comic) => <Link key={comic.id} href={`/comic/${comic.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-bold hover:bg-white/10">{comic.title} • {comic.chapters?.length || 0} chapters</Link>)}
        </div>
      </section>
      <style jsx>{`.input{width:100%;border-radius:1rem;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.3);padding:1rem;outline:none;color:white}.input:focus{border-color:rgb(167 139 250)}.input option{background:#09090b}`}</style>
    </main>
  );
}
