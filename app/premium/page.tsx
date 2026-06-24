"use client";

const plans = [
  {
    months: 1,
    name: "1 сар",
    price: "5,000₮",
    description: "Premium chapter унших эрх",
    paymentLink: "https://pay.wire.mn/link/plink_3y34nzin3jq5ulu6kfrf3maski",
  },
  {
    months: 2,
    name: "2 сар",
    price: "9,000₮",
    description: "2 сарын premium эрх",
    paymentLink: "https://pay.wire.mn/link/plink_iqprgge4w2zs4oebnvvt7d6bii",
  },
  {
    months: 3,
    name: "3 сар",
    price: "13,000₮",
    description: "Илүү хэмнэлттэй багц",
    paymentLink: "https://pay.wire.mn/link/plink_qsagwz2bib34h2ej5ol5kzj1pu",
  },
  {
    months: 6,
    name: "6 сар",
    price: "22,000₮",
    description: "Хагас жилийн premium эрх",
    paymentLink: "https://pay.wire.mn/link/plink_lhyymm676wqbfuctquguyttfm",
  },
  {
    months: 12,
    name: "12 сар",
    price: "35,000₮",
    description: "Хамгийн ашигтай багц",
    paymentLink: "https://pay.wire.mn/link/plink_kcp6gytianawvj5dfgg3gnoxue",
  },
];

export default function PremiumPage() {
  function openPayment(link: string) {
    window.location.href = link;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
            MANGAZET PREMIUM
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Premium эрх авах
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Wire.mn төлбөрийн линкээр төлбөрөө төлөөд premium chapter-уудыг
            уншаарай.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-sm font-semibold text-yellow-200">
          Төлбөр төлсний дараа админ шалгаад premium эрхийг идэвхжүүлнэ.
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {plans.map((plan) => (
            <div
              key={plan.months}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30"
            >
              <h2 className="text-2xl font-black">{plan.name}</h2>

              <p className="mt-2 text-sm text-zinc-400">
                {plan.description}
              </p>

              <div className="mt-6 text-3xl font-black text-yellow-400">
                {plan.price}
              </div>

              <button
                onClick={() => openPayment(plan.paymentLink)}
                className="mt-6 w-full rounded-xl bg-yellow-400 px-4 py-3 font-bold text-black transition hover:bg-yellow-300"
              >
                Wire-р төлөх
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-black text-yellow-400">
            Төлбөр төлсний дараа
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-300">
            Wire/QPay дээр төлбөр амжилттай төлөгдсөний дараа админ төлбөрийг
            шалгаад таны premium эрхийг сонгосон хугацаагаар идэвхжүүлнэ.
          </p>
        </div>
      </section>
    </main>
  );
}