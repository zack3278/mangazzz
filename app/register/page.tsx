"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "otp">("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "Алдаа гарлаа");

      if (res.ok) {
        setStep("otp");
      }
    } catch {
      setMessage("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          code,
        }),
      });

      const data = await res.json();
      setMessage(data.message || "Алдаа гарлаа");

      if (res.ok) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    } catch {
      setMessage("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Бүртгүүлэх</h1>

        <p className="text-sm text-zinc-400 mb-6">
          {step === "form"
            ? "Мэдээллээ оруулаад email OTP код авна."
            : "Email дээр ирсэн 6 оронтой OTP кодоо оруулна уу."}
        </p>

        {step === "form" ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <input
              type="text"
              placeholder="Нэр"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none focus:border-purple-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 py-3 font-semibold hover:bg-purple-700 disabled:opacity-60"
            >
              {loading ? "OTP илгээж байна..." : "OTP код авах"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <input
              type="text"
              placeholder="OTP код"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none focus:border-purple-500"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 py-3 font-semibold hover:bg-purple-700 disabled:opacity-60"
            >
              {loading ? "Шалгаж байна..." : "Бүртгэл үүсгэх"}
            </button>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full rounded-lg border border-zinc-700 py-3 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Email солих
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 rounded-lg bg-zinc-800 px-4 py-3 text-sm text-zinc-300">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-zinc-400">
          Бүртгэлтэй юу?{" "}
          <a href="/login" className="text-purple-400 hover:underline">
            Нэвтрэх
          </a>
        </p>
      </div>
    </main>
  );
}