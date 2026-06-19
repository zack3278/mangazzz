import Navbar from "@/components/Navbar";

const plans = [
  {
    name: "1 сар",
    price: "5,000₮",
    desc: "1 сарын premium эрх",
    value: "1 сарын premium - 5,000₮",
  },
  {
    name: "3 сар",
    price: "13,000₮",
    desc: "3 сарын premium эрх",
    value: "3 сарын premium - 13,000₮",
    popular: true,
  },
  {
    name: "6 сар",
    price: "24,000₮",
    desc: "6 сарын premium эрх",
    value: "6 сарын premium - 24,000₮",
  },
  {
    name: "1 жил",
    price: "44,000₮",
    desc: "12 сарын premium эрх",
    value: "1 жилийн premium - 44,000₮",
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
              className={`rounded-[1.5rem] border p-6 transition ${
                plan.popular
                  ? "border-violet-500/70 bg-violet-950/30"
                  : "border-white/10 bg-white/[0.04] hover:border-violet-500/50 hover:bg-violet-500/10"
              }`}
            >
              {plan.popular && (
                <div className="mb-4 inline-flex rounded-full bg-violet-500 px-3 py-1 text-xs font-black text-white">
                  Хамгийн боломжийн
                </div>
              )}

              <h2 className="text-2xl font-black">{plan.name}</h2>

              <p className="mt-3 text-4xl font-black text-violet-300">
                {plan.price}
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {plan.desc}
              </p>

              <a
                href="#payment"
                className={`mt-6 flex rounded-2xl px-5 py-3 text-center text-sm font-black transition ${
                  plan.popular
                    ? "bg-violet-200 text-black hover:bg-white"
                    : "bg-white text-black hover:bg-violet-200"
                }`}
              >
                Сонгох
              </a>

              <p className="mt-3 text-xs text-zinc-500">
                Гүйлгээний утга дээр:{" "}
                <span className="font-bold text-zinc-300">{plan.value}</span>
              </p>
            </div>
          ))}
        </div>

        <div
          id="payment"
          className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
        >
          <h2 className="text-2xl font-black">Төлбөр төлөх мэдээлэл</h2>

          <div className="mt-5 grid gap-4 text-sm text-zinc-300">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-zinc-500">Банк</p>
              <p className="mt-1 text-lg font-black text-white">Хаан банк</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-zinc-500">Данс</p>
              <p className="mt-1 text-lg font-black text-white">
                Энд өөрийн дансаа бичнэ
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-zinc-500">Гүйлгээний утга</p>
              <p className="mt-1 text-lg font-black text-white">
                Өөрийн email + сонгосон багц
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Жишээ: dulmaa@gmail.com 3 сар premium
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-zinc-500">
            Төлбөр төлсний дараа admin хэрэглэгчийн premium эрхийг идэвхжүүлнэ.
          </p>
        </div>
      </section>
    </main>
  );
}