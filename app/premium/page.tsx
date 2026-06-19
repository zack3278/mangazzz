import Link from "next/link";
import Navbar from "@/components/Navbar";

const plans = [
  {
    name: "1 сар",
    price: "5,000₮",
    desc: "1 сарын premium эрх",
  },
  {
    name: "3 сар",
    price: "13,000₮",
    desc: "3 сарын premium эрх",
  },
  {
    name: "6 сар",
    price: "24,000₮",
    desc: "6 сарын premium эрх",
  },
  {
    name: "1 жил",
    price: "44,000₮",
    desc: "12 сарын premium эрх",
  },
];

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-[#08050f] text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-violet-950 via-zinc-950 to-purple-950 p-8 text-center shadow-2xl shadow-purple-950/30">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-violet-300">
            Premium access
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            Premium эрх авах
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-300">
            Premium эрх авснаар бүх manga/chapter унших боломжтой болно.
            Төлбөрөө шилжүүлээд admin шалгасны дараа эрх идэвхжинэ.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6 transition hover:border-violet-500/50 hover:bg-violet-500/10"
            >
              <h2 className="text-2xl font-black">{plan.name}</h2>

              <p className="mt-3 text-4xl font-black text-violet-300">
                {plan.price}
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {plan.desc}
              </p>

              <Link
                href="/profile"
                className="mt-6 flex rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-black transition hover:bg-violet-200"
              >
                Сонгох
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black">Төлбөр төлөх мэдээлэл</h2>

          <div className="mt-4 grid gap-3 text-sm text-zinc-300">
            <p>
              <span className="font-black text-white">Банк:</span> Хаан банк
            </p>
            <p>
              <span className="font-black text-white">Данс:</span> Энд өөрийн
              дансаа бичнэ
            </p>
            <p>
              <span className="font-black text-white">Гүйлгээний утга:</span>{" "}
              Өөрийн email хаягаа бичнэ
            </p>
          </div>

          <p className="mt-5 text-sm leading-6 text-zinc-500">
            Төлбөр төлсний дараа admin хэрэглэгчийн premium эрхийг идэвхжүүлнэ.
          </p>
        </div>
      </section>
    </main>
  );
}