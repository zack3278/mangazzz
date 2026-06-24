"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroItem = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string;
  bannerImage: string | null;
  status: string;
  chaptersCount: number;
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

function statusBadge(status?: string | null) {
  const value = status || "ONGOING";

  if (value === "COMPLETED") {
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

export default function HomeHeroSlider({ items }: { items: HeroItem[] }) {
  const [index, setIndex] = useState(0);

  const safeItems = items.length > 0 ? items : [];

  useEffect(() => {
    if (safeItems.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % safeItems.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [safeItems.length]);

  if (safeItems.length === 0) {
    return (
      <div className="flex h-[520px] items-center justify-center rounded-xl bg-zinc-900 text-zinc-500">
        Manga нэмэгдээгүй байна
      </div>
    );
  }

  const hero = safeItems[index];

  return (
    <div className="relative">
      <Link
        href={`/comic/${hero.slug}`}
        className="group relative block h-[360px] overflow-hidden rounded-xl bg-zinc-900 md:h-[520px]"
      >
        <img
          src={imageSrc(hero.bannerImage || hero.coverImage)}
          alt={hero.title}
          className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <div className="absolute bottom-10 left-8 max-w-[540px]">
          <p className="mb-4 text-xs font-black text-white/80">Home | TV</p>

          <h1 className="text-4xl font-black leading-tight md:text-5xl">
            {hero.title}
          </h1>

          <p className="mt-4 text-sm font-black text-white/70">
            EP {hero.chaptersCount || 1} • 24m
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {statusBadge(hero.status)}
            <span className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-black text-black">
              HD
            </span>
          </div>

          <p className="mt-5 line-clamp-3 max-w-[430px] text-sm font-medium leading-6 text-white/80">
            {hero.description ||
              "Premium manga унших боломжтой. Шинэ chapter, өндөр чанартай зураг, хурдан унших систем."}
          </p>
        </div>

        <div className="absolute right-7 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-black text-black">
          →
        </div>
      </Link>

      {safeItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {safeItems.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(dotIndex)}
              className={`h-2 rounded-full transition-all ${
                index === dotIndex ? "w-6 bg-yellow-400" : "w-2 bg-white/40"
              }`}
              aria-label={`Slide ${dotIndex + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}