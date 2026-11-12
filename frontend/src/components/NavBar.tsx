import Link from "next/link";

// A2 adds the menu per role (guest / member / admin) and the logout button.
export default function NavBar() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-stone-900 text-sm text-white">C</span>
          CourtBook
        </Link>
        <Link href="/" className="text-sm font-medium text-stone-500 hover:text-stone-900">
          สนามทั้งหมด
        </Link>
      </nav>
    </header>
  );
}
