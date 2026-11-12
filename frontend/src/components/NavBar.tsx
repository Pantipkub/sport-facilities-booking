"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const LINKS = {
  guest: [["/", "สนามทั้งหมด"]],
  member: [["/", "สนามทั้งหมด"], ["/bookings", "การจองของฉัน"]],
  admin: [["/admin", "ภาพรวม"], ["/", "สนามทั้งหมด"], ["/bookings", "การจองทั้งหมด"], ["/admin/facilities", "จัดการสนาม"]],
};

// The longest link that matches the URL is active; facility pages count as "สนามทั้งหมด"
function activeHref(pathname: string, hrefs: string[]) {
  const matches = (href: string) =>
    pathname === href || pathname.startsWith(href === "/" ? "/facilities/" : `${href}/`);
  return hrefs.filter(matches).sort((a, b) => b.length - a.length)[0];
}

export default function NavBar() {
  const user = useSession().data?.user;
  const pathname = usePathname();
  const links = LINKS[user?.role ?? "guest"];
  const active = activeHref(pathname, links.map(([href]) => href));

  return (
    <header className="border-b border-stone-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-8 overflow-x-auto whitespace-nowrap px-6">
        <Link href={user?.role === "admin" ? "/admin" : "/"} className="flex shrink-0 items-center gap-2 font-semibold hover:opacity-80">
          <span className="grid size-7 place-items-center rounded-lg bg-stone-900 text-sm text-white">C</span>
          CourtBook
        </Link>
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={`shrink-0 text-sm font-medium ${href === active ? "text-stone-900" : "text-stone-500 hover:text-stone-900"}`}
          >
            {label}
          </Link>
        ))}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {user ? (
            <>
              <span className="grid size-8 place-items-center rounded-full bg-stone-100 text-xs font-semibold text-stone-700">
                {(user.name.match(/[ก-ฮa-z0-9]/i)?.[0] ?? "?").toUpperCase()}
              </span>
              <span className="text-sm font-medium">{user.name}</span>
              {user.role === "admin" && (
                <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[11px] font-medium text-white">Admin</span>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-2 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`rounded-lg px-4 py-2 text-sm font-medium ${pathname === "/login" ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-100"}`}
              >
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
