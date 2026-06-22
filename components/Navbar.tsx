import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020202]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-3 px-3 sm:px-5">
        <Link href="/" className="flex items-center gap-2 font-black text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-700 text-xs shadow-[0_0_24px_rgba(220,38,38,0.55)]">
            M
          </span>
          <span className="hidden text-sm sm:block">MangaZzz</span>
        </Link>

        <form
          action="/"
          className="ml-auto flex h-9 min-w-0 flex-1 max-w-[460px] items-center rounded-full border border-white/10 bg-[#0a0a0a] px-3"
        >
          <span className="mr-2 text-zinc-500">⌕</span>
          <input
            name="q"
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600"
          />
        </form>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-xs font-black text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/premium"
            className="rounded-lg px-3 py-2 text-xs font-black text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            Premium
          </Link>
          <Link
            href="/profile"
            className="rounded-lg px-3 py-2 text-xs font-black text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            Profile
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white hover:bg-red-600"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}