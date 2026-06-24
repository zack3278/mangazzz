"use client";

import Link from "next/link";
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
        credentials: "include",
        body: JSON.stringify({ email, password }),
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
    <main className="site-shell flex min-h-screen items-center justify-center px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-6 flex w-fit items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-purple-500 text-lg font-black">
            M
          </span>
          <span className="text-xl font-black">Mangazet</span>
        </Link>

        <form onSubmit={handleLogin} className="glass-panel rounded-[2rem] p-6 md:p-8">
          <span className="badge badge-red">Welcome back</span>

          <h1 className="mt-4 text-3xl font-black">Нэвтрэх</h1>

          <p className="mt-2 text-sm font-medium leading-6 text-zinc-400">
            Premium manga уншихын тулд account-аараа нэвтэрнэ үү.
          </p>

          <div className="mt-7 space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="soft-input"
              required
            />

            <input
              type="password"
              placeholder="Нууц үг"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="soft-input"
              required
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-bold text-red-300 hover:text-red-200"
            >
              Нууц үгээ мартсан уу?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="primary-btn mt-6 w-full">
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>

          {message && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm font-bold text-zinc-200">
              {message}
            </div>
          )}

          <p className="mt-6 text-center text-sm font-bold text-zinc-500">
            Бүртгэлгүй юу?{" "}
            <Link href="/register" className="text-red-300 hover:text-red-200">
              Бүртгүүлэх
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}