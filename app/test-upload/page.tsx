"use client";

import { useState } from "react";

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");

  async function handleUpload() {
    if (!file) {
      alert("Зураг сонгоно уу");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "test");

    const res = await fetch("/api/upload/r2", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setResult(data.message || "Upload алдаа");
      return;
    }

    setResult(JSON.stringify(data, null, 2));
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="mb-6 text-2xl font-bold">R2 Upload Test</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4 block"
      />

      <button
        onClick={handleUpload}
        className="rounded bg-blue-600 px-4 py-2"
      >
        Upload test
      </button>

      <pre className="mt-6 whitespace-pre-wrap rounded bg-zinc-900 p-4">
        {result}
      </pre>
    </main>
  );
}