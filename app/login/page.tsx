"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("Email болон нууц үгээ оруулна уу");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Нэвтрэхэд алдаа гарлаа");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setMessage("Амжилттай нэвтэрлээ");

      setTimeout(() => {
        window.location.href = "/profile";
      }, 700);
    } catch {
      setMessage("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Нэвтрэх</h1>

        <p className="text-sm text-zinc-400 mb-6">
          Mangazet account-аараа нэвтэрнэ үү.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none focus:border-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Нууц үг"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none focus:border-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-purple-400 hover:underline"
            >
              Нууц үгээ мартсан уу?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-purple-600 py-3 font-semibold hover:bg-purple-700 disabled:opacity-60"
          >
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg bg-zinc-800 px-4 py-3 text-sm text-zinc-300">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-zinc-400">
          Бүртгэлгүй юу?{" "}
          <a href="/register" className="text-purple-400 hover:underline">
            Бүртгүүлэх
          </a>
        </p>
      </div>
    </main>
  );
}