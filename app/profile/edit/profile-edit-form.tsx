"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState, useTransition } from "react";

function getInitial(name: string) {
  return (name || "U").charAt(0).toUpperCase();
}

export default function ProfileEditForm({
  defaultName,
  defaultImage,
}: {
  defaultName: string;
  defaultImage: string;
}) {
  const router = useRouter();

  const [name, setName] = useState(defaultName);
  const [image, setImage] = useState(defaultImage);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function uploadImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    const res = await fetch("/api/profile/upload", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.message || "Зураг upload хийхэд алдаа гарлаа");
      return;
    }

    setImage(data.url);
  }

  function removeImage() {
    setImage("");
  }

  function saveProfile() {
    startTransition(async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          profileImage: image,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Profile хадгалах үед алдаа гарлаа");
        return;
      }

      router.push("/profile");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-yellow-400/40 bg-gradient-to-br from-yellow-400/20 to-zinc-950">
            {image ? (
              <Image src={image} alt="Profile" fill className="object-cover" />
            ) : (
              <span className="text-4xl font-black text-yellow-300">
                {getInitial(name)}
              </span>
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm font-black text-white">Profile зураг</p>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              JPG, PNG, WEBP зураг upload хийж болно. Зураггүй үед нэрний эхний
              үсэг avatar болж харагдана.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer rounded-2xl bg-yellow-400 px-4 py-2 text-xs font-black text-black hover:bg-yellow-300">
                {uploading ? "Upload хийж байна..." : "Зураг сонгох"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadImage}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {image && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-black text-red-300 hover:bg-red-500/20"
                >
                  Зураг устгах
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-zinc-300">
          Нэр
        </label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Нэрээ оруулна уу"
          className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400"
        />
      </div>

      <button
        type="button"
        onClick={saveProfile}
        disabled={isPending || uploading}
        className="w-full rounded-2xl bg-yellow-400 px-5 py-4 text-sm font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Хадгалж байна..." : "Profile хадгалах"}
      </button>
    </div>
  );
}