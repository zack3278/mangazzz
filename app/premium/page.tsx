import Link from "next/link";
import Navbar from "@/components/Navbar";

const plans = [
  {
    name: "1 сар",
    price: "5,000₮",
    desc: "Эхлээд туршиж үзэхэд тохиромжтой",
    best: false,
  },
  {
    name: "3 сар",
    price: "13,000₮",
    desc: "Хамгийн боломжийн багц",
    best: true,
  },
  {
    name: "6 сар",
    price: "24,000₮",
    desc: "Урт хугацаанд уншигчдад",
    best: false,
  },
  {
    name: "1 жил",
    price: "44,000₮",
    desc: "Бүтэн жилийн premium access",
    best: false,
  },
];

export default function PremiumPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#03030a] text-white">
      <Navbar />

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(126,34,206,0.22),transparent_35%),radial-gradient(circle_at_right,rgba(185,28,28,0.16),transparent_30%),linear-gradient(180deg,#050507,#03030a_45%,#03030a)]" />

      <section className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-950/50 via-zinc-950 to-black p-8 shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-purple-300">
            Premium Access
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-[-0.03em] text-white md:text-6xl">
            Premium эрх аваад бүх manga-г чөлөөтэй уншаарай
          </h1>

          <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-zinc-400 md:text-base">
            Өөрт тохирох багцаа сонгоод доорх данс руу төлбөрөө шилжүүлнэ.
            Гүйлгээний утган дээр өөрийн имэйл эсвэл username-ээ бичээрэй.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.best
                  ? "relative rounded-3xl border border-purple-500/80 bg-purple-950/40 p-6 shadow-[0_18px_60px_rgba(126,34,206,0.25)]"
                  : "relative rounded-3xl border border-white/10 bg-[#111118] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
              }
            >
              {plan.best && (
                <span className="absolute right-5 top-5 rounded-full bg-white px-4 py-1 text-xs font-bold text-black">
                  BEST
                </span>
              )}

              <h2 className="text-2xl font-bold tracking-[-0.02em] text-white">
                {plan.name}
              </h2>

              <p className="mt-5 text-4xl font-bold tracking-[-0.04em] text-white">
                {plan.price}
              </p>

              <p className="mt-4 min-h-[48px] text-sm font-medium leading-6 text-zinc-400">
                {plan.desc}
              </p>

              <Link
                href="#payment"
                className="mt-6 flex h-12 items-center justify-center rounded-2xl bg-white text-base font-bold text-black transition hover:bg-red-600 hover:text-white"
              >
                Сонгох
              </Link>
            </div>
          ))}
        </div>

        <section
          id="payment"
          className="mt-8 grid gap-6 rounded-3xl border border-white/10 bg-[#111118] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.55)] lg:grid-cols-[1fr_1fr]"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-purple-300">
              Дансаар шилжүүлэх
            </p>

            <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-[-0.03em] text-white md:text-4xl">
              Энэ данс руу төлбөр хийхдээ гүйлгээний утган дээрээ имэйл эсвэл
              username бичнэ
            </h2>

            <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-zinc-400">
              Төлбөр орсны дараа admin premium эрхийг баталгаажуулна. Хэрвээ
              төлбөр хийсэн ч эрх ороогүй бол profile хэсгээр эсвэл admin-тай
              холбогдоорой.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-black/45 p-5">
              <p className="text-sm font-medium text-zinc-500">Банк</p>
              <p className="mt-1 text-lg font-bold text-white">Хаан банк</p>
            </div>

            <div className="rounded-2xl bg-black/45 p-5">
              <p className="text-sm font-medium text-zinc-500">Данс</p>
              <p className="mt-1 text-lg font-bold text-white">
                Энд өөрийн дансаа бичнэ
              </p>
            </div>

            <div className="rounded-2xl bg-black/45 p-5">
              <p className="text-sm font-medium text-zinc-500">
                Гүйлгээний утга
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                Өөрийн email + сонгосон багц
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}