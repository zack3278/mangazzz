"use client";

import { useEffect, useState } from "react";

export default function FavoriteButton({ comicId }: { comicId: number }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadFavorite() {
    try {
      const res = await fetch(`/api/favorites?comicId=${comicId}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        setIsFavorite(false);
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setIsFavorite(Boolean(data.isFavorite));
      }
    } catch {
      setIsFavorite(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comicId]);

  async function toggleFavorite() {
    try {
      setSaving(true);

      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          comicId,
        }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Favorite өөрчлөхөд алдаа гарлаа");
        return;
      }

      setIsFavorite(Boolean(data.isFavorite));
    } catch {
      alert("Favorite өөрчлөхөд алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading || saving}
      className={`rounded-xl px-6 py-3 text-sm font-black transition ${
        isFavorite
          ? "bg-red-500 text-white hover:bg-red-400"
          : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
      }`}
    >
      {loading ? "..." : isFavorite ? "♥ Favorite" : "♡ Favorite"}
    </button>
  );
}