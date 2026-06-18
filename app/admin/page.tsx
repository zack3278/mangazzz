"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "EDITOR" | "ADMIN";
  isPremium: boolean;
  premiumExpiresAt: string | null;
  createdAt: string;
};

type Chapter = {
  id: number;
  title: string;
  number: number;
  images: {
    id: number;
    imageUrl: string;
    order: number;
  }[];
};

type Comic = {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  author: string | null;
  genre: string;
  genre2: string | null;
  genre3: string | null;
  chapters: Chapter[];
};

const genreOptions = [
  "Тулаант",
  "Романс",
  "Фантази",
  "Инээдэм",
  "Драма",
  "Аймшиг",
  "Адал Явдал",
  "Солонгос",
  "Япон",
  "Хятад",
  "Сургааль",
  "Isekai",
  "Мурим",
  "Охидийн",
  "Түүхэн",
  "Нууцлаг",
  "Спорт",
  "Бусад",
];

function formatPremiumDate(date: string | null) {
  if (!date) return "Хугацаа байхгүй";

  return new Date(date).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function isPremiumActive(user: User) {
  if (!user.isPremium || !user.premiumExpiresAt) return false;

  const expiresAt = new Date(user.premiumExpiresAt);
  const now = new Date();

  return expiresAt.getTime() > now.getTime();
}

function getPremiumStatus(user: User) {
  if (!user.isPremium || !user.premiumExpiresAt) {
    return "NONE";
  }

  if (isPremiumActive(user)) {
    return "ACTIVE";
  }

  return "EXPIRED";
}

export default function AdminPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [comics, setComics] = useState<Comic[]>([]);

  const [comicTitle, setComicTitle] = useState("");
  const [comicSlug, setComicSlug] = useState("");
  const [comicDescription, setComicDescription] = useState("");
  const [comicAuthor, setComicAuthor] = useState("");
  const [comicGenre, setComicGenre] = useState("Бусад");
  const [comicGenre2, setComicGenre2] = useState("");
  const [comicGenre3, setComicGenre3] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const [selectedComicId, setSelectedComicId] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterImages, setChapterImages] = useState<string[]>([]);

  const [editingComic, setEditingComic] = useState<Comic | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editGenre, setEditGenre] = useState("Бусад");
  const [editGenre2, setEditGenre2] = useState("");
  const [editGenre3, setEditGenre3] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverImage, setEditCoverImage] = useState("");

  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterNumber, setEditChapterNumber] = useState("");
  const [editChapterImages, setEditChapterImages] = useState<string[]>([]);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingEditCover, setUploadingEditCover] = useState(false);
  const [uploadingChapter, setUploadingChapter] = useState(false);
  const [uploadingEditChapter, setUploadingEditChapter] = useState(false);

  const [savingComic, setSavingComic] = useState(false);
  const [savingEditComic, setSavingEditComic] = useState(false);
  const [savingChapter, setSavingChapter] = useState(false);
  const [savingEditChapter, setSavingEditChapter] = useState(false);

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Users ачаалахад алдаа гарлаа");
        return;
      }

      if (Array.isArray(data)) {
        setUsers(data);
        return;
      }

      if (Array.isArray(data.users)) {
        setUsers(data.users);
        return;
      }

      setUsers([]);
    } catch (error) {
      console.error(error);
      alert("Users ачаалахад алдаа гарлаа");
    }
  }

  async function loadComics() {
    try {
      const res = await fetch("/api/comics");
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Comics ачаалахад алдаа гарлаа");
        return;
      }

      if (Array.isArray(data)) {
        setComics(data);
        return;
      }

      if (Array.isArray(data.comics)) {
        setComics(data.comics);
        return;
      }

      setComics([]);
    } catch (error) {
      console.error(error);
      alert("Comics ачаалахад алдаа гарлаа");
    }
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (!res.ok || !data.user) {
          location.href = "/login";
          return;
        }

        if (data.user.role !== "ADMIN") {
          location.href = "/";
          return;
        }

        setCheckingAuth(false);
        loadUsers();
        loadComics();
      } catch (error) {
        console.error(error);
        location.href = "/login";
      }
    }

    checkAuth();
  }, []);

  async function changeRole(userId: number, role: User["role"]) {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Role өөрчлөхөд алдаа гарлаа");
      return;
    }

    alert("Role амжилттай өөрчлөгдлөө");
    loadUsers();
  }

  async function changePremium(userId: number, months: 1 | 2 | 3 | 6 | 12) {
    const res = await fetch(`/api/admin/users/${userId}/premium`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "grant",
        months,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Premium эрх өөрчлөхөд алдаа гарлаа");
      return;
    }

    alert(data.message || "Premium эрх амжилттай өөрчлөгдлөө");
    loadUsers();
  }

  async function cancelPremium(userId: number) {
    const ok = confirm("Энэ хэрэглэгчийн premium эрхийг цуцлах уу?");

    if (!ok) return;

    const res = await fetch(`/api/admin/users/${userId}/premium`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "cancel",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Premium эрх цуцлахад алдаа гарлаа");
      return;
    }

    alert(data.message || "Premium эрхийг цуцаллаа");
    loadUsers();
  }

  async function uploadCover(file: File | null) {
    if (!file) return;

    setUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "cover");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Cover upload хийхэд алдаа гарлаа");
        return;
      }

      setCoverImage(data.url);
    } finally {
      setUploadingCover(false);
    }
  }

  async function uploadEditCover(file: File | null) {
    if (!file) return;

    setUploadingEditCover(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "cover");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Cover upload хийхэд алдаа гарлаа");
        return;
      }

      setEditCoverImage(data.url);
    } finally {
      setUploadingEditCover(false);
    }
  }

  async function uploadChapterImages(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploadingChapter(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "chapter");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Chapter зураг upload хийхэд алдаа гарлаа");
          continue;
        }

        uploadedUrls.push(data.url);
      }

      setChapterImages((prev) => [...prev, ...uploadedUrls]);
    } finally {
      setUploadingChapter(false);
    }
  }

  async function uploadEditChapterImages(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploadingEditChapter(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "chapter");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Chapter зураг upload хийхэд алдаа гарлаа");
          continue;
        }

        uploadedUrls.push(data.url);
      }

      setEditChapterImages((prev) => [...prev, ...uploadedUrls]);
    } finally {
      setUploadingEditChapter(false);
    }
  }

  function removeChapterImage(index: number) {
    setChapterImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeEditChapterImage(index: number) {
    setEditChapterImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function addComic(e: FormEvent) {
    e.preventDefault();

    if (
      !comicTitle ||
      !comicSlug ||
      !comicDescription ||
      !coverImage ||
      !comicGenre
    ) {
      alert("Title, slug, description, cover image, genre 1 заавал хэрэгтэй");
      return;
    }

    setSavingComic(true);

    try {
      const res = await fetch("/api/comics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: comicTitle,
          slug: comicSlug,
          description: comicDescription,
          coverImage,
          author: comicAuthor,
          genre: comicGenre,
          genre2: comicGenre2,
          genre3: comicGenre3,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Comic нэмэхэд алдаа гарлаа");
        return;
      }

      alert("Comic амжилттай нэмэгдлээ");

      setComicTitle("");
      setComicSlug("");
      setComicDescription("");
      setComicAuthor("");
      setComicGenre("Бусад");
      setComicGenre2("");
      setComicGenre3("");
      setCoverImage("");

      loadComics();
    } finally {
      setSavingComic(false);
    }
  }

  function openEditComic(comic: Comic) {
    setEditingComic(comic);
    setEditTitle(comic.title);
    setEditSlug(comic.slug);
    setEditAuthor(comic.author || "");
    setEditGenre(comic.genre || "Бусад");
    setEditGenre2(comic.genre2 || "");
    setEditGenre3(comic.genre3 || "");
    setEditDescription(comic.description);
    setEditCoverImage(comic.coverImage);
  }

  function closeEditComic() {
    setEditingComic(null);
    setEditTitle("");
    setEditSlug("");
    setEditAuthor("");
    setEditGenre("Бусад");
    setEditGenre2("");
    setEditGenre3("");
    setEditDescription("");
    setEditCoverImage("");
  }

  async function saveEditComic(e: FormEvent) {
    e.preventDefault();

    if (!editingComic) return;

    if (
      !editTitle ||
      !editSlug ||
      !editDescription ||
      !editCoverImage ||
      !editGenre
    ) {
      alert("Title, slug, description, cover image, genre 1 заавал хэрэгтэй");
      return;
    }

    setSavingEditComic(true);

    try {
      const res = await fetch(`/api/comics/${editingComic.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          slug: editSlug,
          description: editDescription,
          coverImage: editCoverImage,
          author: editAuthor,
          genre: editGenre,
          genre2: editGenre2,
          genre3: editGenre3,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Comic засахад алдаа гарлаа");
        return;
      }

      alert("Comic амжилттай засагдлаа");

      closeEditComic();
      loadComics();
    } finally {
      setSavingEditComic(false);
    }
  }

  async function addChapter(e: FormEvent) {
    e.preventDefault();

    if (!selectedComicId || !chapterTitle || !chapterNumber) {
      alert("Comic, chapter title, chapter number оруулна уу");
      return;
    }

    if (chapterImages.length === 0) {
      alert("Chapter зураг оруулна уу");
      return;
    }

    setSavingChapter(true);

    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: chapterTitle,
          number: Number(chapterNumber),
          comicId: Number(selectedComicId),
          images: chapterImages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Chapter нэмэхэд алдаа гарлаа");
        return;
      }

      alert("Chapter амжилттай нэмэгдлээ");

      setSelectedComicId("");
      setChapterTitle("");
      setChapterNumber("");
      setChapterImages([]);

      loadComics();
    } finally {
      setSavingChapter(false);
    }
  }

  function openEditChapter(chapter: Chapter) {
    setEditingChapter(chapter);
    setEditChapterTitle(chapter.title);
    setEditChapterNumber(String(chapter.number));
    setEditChapterImages(chapter.images.map((image) => image.imageUrl));
  }

  function closeEditChapter() {
    setEditingChapter(null);
    setEditChapterTitle("");
    setEditChapterNumber("");
    setEditChapterImages([]);
  }

  async function saveEditChapter(e: FormEvent) {
    e.preventDefault();

    if (!editingChapter) return;

    if (!editChapterTitle || !editChapterNumber) {
      alert("Chapter title болон number оруулна уу");
      return;
    }

    if (editChapterImages.length === 0) {
      alert("Chapter зураг оруулна уу");
      return;
    }

    setSavingEditChapter(true);

    try {
      const res = await fetch(`/api/chapters/${editingChapter.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editChapterTitle,
          number: Number(editChapterNumber),
          images: editChapterImages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Chapter засахад алдаа гарлаа");
        return;
      }

      alert("Chapter амжилттай засагдлаа");

      closeEditChapter();
      loadComics();
    } finally {
      setSavingEditChapter(false);
    }
  }

  async function deleteComic(comicId: number) {
    const ok = confirm(
      "Энэ comic-ийг устгах уу? Доторх бүх chapter хамт устна."
    );

    if (!ok) return;

    const res = await fetch(`/api/comics/${comicId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Comic устгахад алдаа гарлаа");
      return;
    }

    alert("Comic устлаа");
    loadComics();
  }

  async function deleteChapter(chapterId: number) {
    const ok = confirm("Энэ chapter-ийг устгах уу?");

    if (!ok) return;

    const res = await fetch(`/api/chapters/${chapterId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Chapter устгахад алдаа гарлаа");
      return;
    }

    alert("Chapter устлаа");
    loadComics();
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    location.href = "/login";
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4">
          Шалгаж байна...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-8 py-8 text-white">
      {editingComic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            onSubmit={saveEditComic}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-zinc-900 p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Comic засах</h2>

              <button
                type="button"
                onClick={closeEditComic}
                className="rounded-lg bg-zinc-800 px-3 py-2 hover:bg-zinc-700"
              >
                X
              </button>
            </div>

            <label className="mb-2 block text-sm text-zinc-400">Title</label>
            <input
              className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />

            <label className="mb-2 block text-sm text-zinc-400">Slug</label>
            <input
              className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
            />

            <label className="mb-2 block text-sm text-zinc-400">Author</label>
            <input
              className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
              value={editAuthor}
              onChange={(e) => setEditAuthor(e.target.value)}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Genre 1
                </label>
                <select
                  className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
                  value={editGenre}
                  onChange={(e) => setEditGenre(e.target.value)}
                >
                  {genreOptions.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Genre 2
                </label>
                <select
                  className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
                  value={editGenre2}
                  onChange={(e) => setEditGenre2(e.target.value)}
                >
                  <option value="">Хоосон</option>
                  {genreOptions.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Genre 3
                </label>
                <select
                  className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
                  value={editGenre3}
                  onChange={(e) => setEditGenre3(e.target.value)}
                >
                  <option value="">Хоосон</option>
                  {genreOptions.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="mb-2 block text-sm text-zinc-400">
              Cover image солих
            </label>
            <input
              className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
              type="file"
              accept="image/*"
              onChange={(e) => uploadEditCover(e.target.files?.[0] || null)}
            />

            {uploadingEditCover && (
              <p className="mb-4 text-yellow-400">
                Cover upload хийж байна...
              </p>
            )}

            {editCoverImage && (
              <div className="mb-4 rounded-lg bg-zinc-800 p-3">
                <img
                  src={editCoverImage}
                  alt="cover preview"
                  className="h-64 w-44 rounded object-cover"
                />

                <p className="mt-2 text-sm text-zinc-400">{editCoverImage}</p>
              </div>
            )}

            <label className="mb-2 block text-sm text-zinc-400">
              Description
            </label>
            <textarea
              className="mb-4 h-32 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

            <button
              disabled={savingEditComic || uploadingEditCover}
              className="w-full rounded-lg bg-red-600 py-3 font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >
              {savingEditComic ? "Хадгалж байна..." : "Засварыг хадгалах"}
            </button>
          </form>
        </div>
      )}

      {editingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            onSubmit={saveEditChapter}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-zinc-900 p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Chapter засах</h2>

              <button
                type="button"
                onClick={closeEditChapter}
                className="rounded-lg bg-zinc-800 px-3 py-2 hover:bg-zinc-700"
              >
                X
              </button>
            </div>

            <label className="mb-2 block text-sm text-zinc-400">
              Chapter title
            </label>
            <input
              className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
              value={editChapterTitle}
              onChange={(e) => setEditChapterTitle(e.target.value)}
            />

            <label className="mb-2 block text-sm text-zinc-400">
              Chapter number
            </label>
            <input
              className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
              type="number"
              value={editChapterNumber}
              onChange={(e) => setEditChapterNumber(e.target.value)}
            />

            <label className="mb-2 block text-sm text-zinc-400">
              Шинэ зураг нэмэх
            </label>
            <input
              className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => uploadEditChapterImages(e.target.files)}
            />

            {uploadingEditChapter && (
              <p className="mb-4 text-yellow-400">
                Chapter зураг upload хийж байна...
              </p>
            )}

            {editChapterImages.length > 0 && (
              <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                {editChapterImages.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="rounded-lg bg-zinc-800 p-2"
                  >
                    <img
                      src={url}
                      alt="chapter preview"
                      className="h-40 w-full rounded object-cover"
                    />

                    <p className="mt-2 text-xs text-zinc-400">
                      Page {index + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeEditChapterImage(index)}
                      className="mt-2 w-full rounded bg-red-600 py-1 text-sm hover:bg-red-700"
                    >
                      Устгах
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              disabled={savingEditChapter || uploadingEditChapter}
              className="w-full rounded-lg bg-red-600 py-3 font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >
              {savingEditChapter ? "Хадгалж байна..." : "Chapter хадгалах"}
            </button>
          </form>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="mt-2 text-zinc-400">
            User, role, premium, comic, chapter удирдах хэсэг
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
          >
            Нүүр
          </Link>

          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
          >
            Гарах
          </button>
        </div>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-4">
        <div className="rounded-2xl bg-zinc-900 p-6">
          <p className="text-zinc-400">Users</p>
          <h2 className="mt-2 text-4xl font-bold">{users.length}</h2>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-6">
          <p className="text-zinc-400">Comics</p>
          <h2 className="mt-2 text-4xl font-bold">{comics.length}</h2>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-6">
          <p className="text-zinc-400">Chapters</p>
          <h2 className="mt-2 text-4xl font-bold">
            {comics.reduce((sum, comic) => sum + comic.chapters.length, 0)}
          </h2>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-6">
          <p className="text-zinc-400">Genres</p>
          <h2 className="mt-2 text-4xl font-bold">{genreOptions.length}</h2>
        </div>
      </div>

      <div className="mb-8 rounded-2xl bg-zinc-900 p-6">
        <h2 className="mb-5 text-2xl font-bold">User role / premium удирдах</h2>

        {users.length === 0 ? (
          <p className="text-zinc-400">User байхгүй байна.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-3">ID</th>
                  <th className="py-3">Нэр</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Premium</th>
                  <th className="py-3">Role солих</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-800">
                    <td className="py-3">{user.id}</td>
                    <td className="py-3">{user.name}</td>
                    <td className="py-3">{user.email}</td>
                    <td className="py-3">{user.role}</td>

                    <td className="py-3">
                      <div className="flex min-w-[280px] flex-col gap-2">
                        {getPremiumStatus(user) === "ACTIVE" ? (
                          <div>
                            <span className="w-fit rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-300">
                              Premium идэвхтэй
                            </span>

                            <p className="mt-2 text-xs text-zinc-400">
                              Дуусах огноо:{" "}
                              {formatPremiumDate(user.premiumExpiresAt)}
                            </p>
                          </div>
                        ) : getPremiumStatus(user) === "EXPIRED" ? (
                          <div>
                            <span className="w-fit rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-300">
                              Premium дууссан
                            </span>

                            <p className="mt-2 text-xs text-zinc-400">
                              Дууссан огноо:{" "}
                              {formatPremiumDate(user.premiumExpiresAt)}
                            </p>
                          </div>
                        ) : (
                          <span className="w-fit rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-400">
                            Free
                          </span>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => changePremium(user.id, 1)}
                            className="rounded-lg bg-yellow-600 px-3 py-2 text-xs font-semibold hover:bg-yellow-700"
                          >
                            1 сар (5000₮)
                          </button>

                          <button
                            type="button"
                            onClick={() => changePremium(user.id, 2)}
                            className="rounded-lg bg-yellow-600 px-3 py-2 text-xs font-semibold hover:bg-yellow-700"
                          >
                            2 сар (9000₮)
                          </button>

                          <button
                            type="button"
                            onClick={() => changePremium(user.id, 3)}
                            className="rounded-lg bg-yellow-600 px-3 py-2 text-xs font-semibold hover:bg-yellow-700"
                          >
                            3 сар (13000₮)
                          </button>

                          <button
                            type="button"
                            onClick={() => changePremium(user.id, 6)}
                            className="rounded-lg bg-yellow-600 px-3 py-2 text-xs font-semibold hover:bg-yellow-700"
                          >
                            6 сар (22000₮)
                          </button>

                          <button
                            type="button"
                            onClick={() => changePremium(user.id, 12)}
                            className="rounded-lg bg-yellow-600 px-3 py-2 text-xs font-semibold hover:bg-yellow-700"
                          >
                            12 сар (35000₮)
                          </button>

                          <button
                            type="button"
                            onClick={() => cancelPremium(user.id)}
                            className="rounded-lg bg-zinc-700 px-3 py-2 text-xs font-semibold hover:bg-zinc-600"
                          >
                            Цуцлах
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <select
                        className="rounded-lg bg-zinc-800 px-3 py-2 outline-none"
                        value={user.role}
                        onChange={(e) =>
                          changeRole(user.id, e.target.value as User["role"])
                        }
                      >
                        <option value="USER">USER</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        <form onSubmit={addComic} className="rounded-2xl bg-zinc-900 p-6">
          <h2 className="mb-5 text-2xl font-bold">Comic / Manga нэмэх</h2>

          <label className="mb-2 block text-sm text-zinc-400">Title</label>
          <input
            className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
            placeholder="Жишээ: Solo Leveling"
            value={comicTitle}
            onChange={(e) => setComicTitle(e.target.value)}
          />

          <label className="mb-2 block text-sm text-zinc-400">Slug</label>
          <input
            className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
            placeholder="Жишээ: solo-leveling"
            value={comicSlug}
            onChange={(e) => setComicSlug(e.target.value)}
          />

          <label className="mb-2 block text-sm text-zinc-400">Author</label>
          <input
            className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
            placeholder="Author"
            value={comicAuthor}
            onChange={(e) => setComicAuthor(e.target.value)}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Genre 1
              </label>
              <select
                className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
                value={comicGenre}
                onChange={(e) => setComicGenre(e.target.value)}
              >
                {genreOptions.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Genre 2
              </label>
              <select
                className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
                value={comicGenre2}
                onChange={(e) => setComicGenre2(e.target.value)}
              >
                <option value="">Хоосон</option>
                {genreOptions.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Genre 3
              </label>
              <select
                className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
                value={comicGenre3}
                onChange={(e) => setComicGenre3(e.target.value)}
              >
                <option value="">Хоосон</option>
                {genreOptions.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="mb-2 block text-sm text-zinc-400">
            Cover image
          </label>
          <input
            className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
            type="file"
            accept="image/*"
            onChange={(e) => uploadCover(e.target.files?.[0] || null)}
          />

          {uploadingCover && (
            <p className="mb-4 text-yellow-400">Cover upload хийж байна...</p>
          )}

          {coverImage && (
            <div className="mb-4 rounded-lg bg-zinc-800 p-3">
              <img
                src={coverImage}
                alt="cover preview"
                className="h-64 w-44 rounded object-cover"
              />

              <p className="mt-2 text-sm text-zinc-400">{coverImage}</p>
            </div>
          )}

          <label className="mb-2 block text-sm text-zinc-400">
            Description
          </label>
          <textarea
            className="mb-4 h-32 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
            placeholder="Description"
            value={comicDescription}
            onChange={(e) => setComicDescription(e.target.value)}
          />

          <button
            disabled={savingComic || uploadingCover}
            className="w-full rounded-lg bg-red-600 py-3 font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
          >
            {savingComic ? "Хадгалж байна..." : "Comic нэмэх"}
          </button>
        </form>

        <form onSubmit={addChapter} className="rounded-2xl bg-zinc-900 p-6">
          <h2 className="mb-5 text-2xl font-bold">Chapter нэмэх</h2>

          <label className="mb-2 block text-sm text-zinc-400">
            Comic сонгох
          </label>
          <select
            className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
            value={selectedComicId}
            onChange={(e) => setSelectedComicId(e.target.value)}
          >
            <option value="">Comic сонгох</option>

            {comics.map((comic) => (
              <option key={comic.id} value={comic.id}>
                {comic.title} /{" "}
                {[comic.genre, comic.genre2, comic.genre3]
                  .filter(Boolean)
                  .join(", ")}
              </option>
            ))}
          </select>

          <label className="mb-2 block text-sm text-zinc-400">
            Chapter title
          </label>
          <input
            className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
            placeholder="Жишээ: Эхлэл"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
          />

          <label className="mb-2 block text-sm text-zinc-400">
            Chapter number
          </label>
          <input
            className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
            type="number"
            placeholder="Жишээ: 1"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
          />

          <label className="mb-2 block text-sm text-zinc-400">
            Chapter images
          </label>
          <input
            className="mb-4 w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => uploadChapterImages(e.target.files)}
          />

          {uploadingChapter && (
            <p className="mb-4 text-yellow-400">
              Chapter зураг upload хийж байна...
            </p>
          )}

          {chapterImages.length > 0 && (
            <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              {chapterImages.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="rounded-lg bg-zinc-800 p-2"
                >
                  <img
                    src={url}
                    alt="chapter preview"
                    className="h-40 w-full rounded object-cover"
                  />

                  <p className="mt-2 text-xs text-zinc-400">
                    Page {index + 1}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeChapterImage(index)}
                    className="mt-2 w-full rounded bg-red-600 py-1 text-sm hover:bg-red-700"
                  >
                    Устгах
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            disabled={savingChapter || uploadingChapter}
            className="w-full rounded-lg bg-red-600 py-3 font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
          >
            {savingChapter ? "Хадгалж байна..." : "Chapter нэмэх"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-zinc-900 p-6">
        <h2 className="mb-5 text-2xl font-bold">Comic / Chapter жагсаалт</h2>

        {comics.length === 0 ? (
          <p className="text-zinc-400">Comic байхгүй байна.</p>
        ) : (
          <div className="space-y-5">
            {comics.map((comic) => (
              <div key={comic.id} className="rounded-xl bg-zinc-800 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <img
                      src={comic.coverImage}
                      alt={comic.title}
                      className="h-32 w-24 rounded object-cover"
                    />

                    <div>
                      <h3 className="text-xl font-bold">{comic.title}</h3>
                      <p className="text-sm text-zinc-400">/{comic.slug}</p>

                      <p className="mt-1 text-sm text-zinc-400">
                        Author: {comic.author || "Unknown"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {[comic.genre, comic.genre2, comic.genre3]
                          .filter(Boolean)
                          .map((genre) => (
                            <span
                              key={genre}
                              className="rounded-full bg-red-600/20 px-3 py-1 text-sm text-red-300"
                            >
                              {genre}
                            </span>
                          ))}
                      </div>

                      <Link
                        href={`/comic/${comic.slug}`}
                        className="mt-3 block text-sm text-red-400 hover:text-red-300"
                      >
                        Нээх
                      </Link>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditComic(comic)}
                      className="rounded-lg bg-zinc-700 px-4 py-2 hover:bg-zinc-600"
                    >
                      Засах
                    </button>

                    <button
                      onClick={() => deleteComic(comic.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
                    >
                      Устгах
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <h4 className="mb-3 font-semibold">Chapters</h4>

                  {comic.chapters.length === 0 ? (
                    <p className="text-sm text-zinc-400">
                      Chapter байхгүй байна.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {comic.chapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-3"
                        >
                          <div>
                            <p className="font-medium">
                              Chapter {chapter.number}: {chapter.title}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {chapter.images.length} images
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditChapter(chapter)}
                              className="rounded bg-zinc-700 px-3 py-1 text-sm hover:bg-zinc-600"
                            >
                              Засах
                            </button>

                            <button
                              onClick={() => deleteChapter(chapter.id)}
                              className="rounded bg-red-600 px-3 py-1 text-sm hover:bg-red-700"
                            >
                              Устгах
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}