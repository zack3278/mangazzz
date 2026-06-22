import Navbar from "@/components/Navbar";

const plans = [
  { months: 1, name: "1 сар", price: "5,000₮", desc: "Эхлээд туршиж үзэхэд тохиромжтой" },
  { months: 3, name: "3 сар", price: "13,000₮", desc: "Хамгийн боломжийн багц", popular: true },
  { months: 6, name: "6 сар", price: "24,000₮", desc: "Урт хугацаанд уншигчдад" },
  { months: 12, name: "1 жил", price: "44,000₮", desc: "Бүтэн жилийн premium access" },
];

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-[#080711] text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-violet-500/20 via-white/[0.05] to-fuchsia-500/10 p-8 md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-violet-200">Premium access</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-black leading-none md:text-7xl">Unlock every chapter.</h1>
          <p className="mt-5 max-w-2xl text-zinc-300">Premium эрх авснаар бүх manga/chapter унших боломжтой. Төлбөрөө шилжүүлээд admin шалгасны дараа эрх идэвхжинэ.</p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {plans.map((plan) => (
            <div key={plan.months} className={`relative rounded-[28px] border p-6 ${plan.popular ? "border-violet-400 bg-violet-500/15" : "border-white/10 bg-white/[0.04]"}`}>
              {plan.popular && <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-black text-black">BEST</span>}
              <h2 className="text-2xl font-black">{plan.name}</h2>
              <p className="mt-3 text-4xl font-black">{plan.price}</p>
              <p className="mt-3 text-sm text-zinc-400">{plan.desc}</p>
              <a href="#payment" className="mt-6 block rounded-2xl bg-white py-3 text-center font-black text-black">Сонгох</a>
            </div>
          ))}
        </div>

        <div id="payment" className="mt-8 grid gap-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-300">Bank transfer</p>
            <h2 className="mt-2 text-3xl font-black">Төлбөр төлөх мэдээлэл</h2>
            <p className="mt-3 text-zinc-400">Доорх мэдээллийг өөрийн банкны дансаар солино.</p>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-black/30 p-4"><p className="text-xs text-zinc-500">Банк</p><b>Хаан банк</b></div>
            <div className="rounded-2xl bg-black/30 p-4"><p className="text-xs text-zinc-500">Данс</p><b>Энд өөрийн дансаа бичнэ</b></div>
            <div className="rounded-2xl bg-black/30 p-4"><p className="text-xs text-zinc-500">Гүйлгээний утга</p><b>Өөрийн email + сонгосон багц</b></div>
          </div>
        </div>
      </section>
    </main>
  );
}
