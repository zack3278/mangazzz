"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset">("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "Алдаа гарлаа");

      if (res.ok) {
        setStep("reset");
      }
    } catch {
      setMessage("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (newPassword.length < 6) {
      setMessage("Шинэ нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
          newPassword,
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
        <h1 className="text-2xl font-bold mb-2">Нууц үг сэргээх</h1>

        <p className="text-sm text-zinc-400 mb-6">
          {step === "email"
            ? "Бүртгэлтэй email хаягаа оруулж OTP код авна."
            : "Email дээр ирсэн OTP код болон шинэ нууц үгээ оруулна уу."}
        </p>

        {step === "email" ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none focus:border-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <form onSubmit={resetPassword} className="space-y-4">
            <input
              type="text"
              placeholder="OTP код"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none focus:border-purple-500"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Шинэ нууц үг / хамгийн багадаа 6 тэмдэгт"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none focus:border-purple-500"
              value={newPassword}
              minLength={6}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 py-3 font-semibold hover:bg-purple-700 disabled:opacity-60"
            >
              {loading ? "Шинэчилж байна..." : "Нууц үг шинэчлэх"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setNewPassword("");
                setMessage("");
              }}
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
          Санасан уу?{" "}
          <a href="/login" className="text-purple-400 hover:underline">
            Нэвтрэх
          </a>
        </p>
      </div>
    </main>
  );
}