"use client";

import Link from "next/link";
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
    setMessage("");

    if (password.length < 6) {
      setMessage("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    setMessage("");

    if (password.length < 6) {
      setMessage("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, code }),
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
          onSubmit={step === "form" ? sendOtp : verifyOtp}
          className="glass-panel rounded-[2rem] p-6 md:p-8"
        >
          <span className="badge badge-gold">
            {step === "form" ? "Create account" : "Verify email"}
          </span>

          <h1 className="mt-4 text-3xl font-black">Бүртгүүлэх</h1>

          <p className="mt-2 text-sm font-medium leading-6 text-zinc-400">
            {step === "form"
              ? "Мэдээллээ оруулаад email OTP код авна."
              : "Email дээр ирсэн 6 оронтой OTP кодоо оруулна уу."}
          </p>

          {step === "form" ? (
            <div className="mt-7 space-y-4">
              <input
                placeholder="Нэр"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="soft-input"
                required
              />

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
                placeholder="Нууц үг / хамгийн багадаа 6 тэмдэгт"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="soft-input"
                required
              />

              <button disabled={loading} className="primary-btn w-full" type="submit">
                {loading ? "OTP илгээж байна..." : "OTP код авах"}
              </button>
            </div>
          ) : (
            <div className="mt-7 space-y-4">
              <input
                placeholder="OTP код"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="soft-input text-center text-2xl font-black tracking-[0.35em]"
                required
              />

              <button disabled={loading} className="primary-btn w-full" type="submit">
                {loading ? "Шалгаж байна..." : "Бүртгэл үүсгэх"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setCode("");
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
            Бүртгэлтэй юу?{" "}
            <Link href="/login" className="text-red-300 hover:text-red-200">
              Нэвтрэх
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}