"use client";

import Link from "next/link";
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

    if (!email.trim()) {
      setMessage("Email хаягаа оруулна уу");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
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

    if (!code.trim()) {
      setMessage("OTP кодоо оруулна уу");
      return;
    }

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
          email: email.trim(),
          code: code.trim(),
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
    <main className="site-shell flex min-h-screen items-center justify-center px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-6 flex w-fit items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-purple-500 text-lg font-black">
            M
          </span>

          <span className="text-xl font-black">Mangazet</span>
        </Link>

        <form
          onSubmit={step === "email" ? sendOtp : resetPassword}
          className="glass-panel rounded-[2rem] p-6 md:p-8"
        >
          <span className="badge badge-red">Account recovery</span>

          <h1 className="mt-4 text-3xl font-black">Нууц үг сэргээх</h1>

          <p className="mt-2 text-sm font-medium leading-6 text-zinc-400">
            {step === "email"
              ? "Бүртгэлтэй email хаягаа оруул. Бид OTP код илгээнэ."
              : "Email дээр ирсэн OTP код болон шинэ нууц үгээ оруулна уу."}
          </p>

          {step === "email" ? (
            <div className="mt-7 space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="soft-input"
                required
              />

              <button
                disabled={loading}
                className="primary-btn w-full"
                type="submit"
              >
                {loading ? "OTP илгээж байна..." : "OTP код авах"}
              </button>
            </div>
          ) : (
            <div className="mt-7 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Email
                </p>
                <p className="mt-1 break-all text-sm font-black text-zinc-200">
                  {email}
                </p>
              </div>

              <input
                placeholder="OTP код"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="soft-input text-center text-2xl font-black tracking-[0.35em]"
                required
              />

              <input
                type="password"
                placeholder="Шинэ нууц үг / 6+ тэмдэгт"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="soft-input"
                required
              />

              <button
                disabled={loading}
                className="primary-btn w-full"
                type="submit"
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
                className="secondary-btn w-full"
              >
                Email солих
              </button>
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm font-bold text-zinc-200">
              {message}
            </div>
          )}

          <p className="mt-6 text-center text-sm font-bold text-zinc-500">
            Санасан уу?{" "}
            <Link href="/login" className="text-red-300 hover:text-red-200">
              Нэвтрэх
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}