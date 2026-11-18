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
    <header className="border-b border-[var(--line)] bg-[#fffcf6]">
      <nav aria-label="เมนูหลัก" className="mx-auto flex max-w-6xl flex-wrap items-center gap-2.5 px-4 py-3 sm:px-6">
        <Link href={user?.role === "admin" ? "/admin" : "/"} className="cb-title flex shrink-0 items-center gap-2 font-semibold hover:opacity-80">
          <span aria-hidden="true" className="cb-primary grid size-8 -rotate-6 place-items-center rounded-lg border border-white text-sm shadow-sm">C</span>
          <span className="cb-wordmark">CourtBook</span>
        </Link>
        <div className="order-last flex min-w-0 basis-full flex-wrap gap-1 border-t border-[var(--line)] pt-2 sm:order-none sm:basis-auto sm:border-0 sm:pt-0">
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={href === active ? "page" : undefined}
            className={`rounded-full px-2.5 py-1.5 text-sm font-medium ${href === active ? "cb-title bg-[var(--sky)]" : "hover:bg-[var(--paper)]"}`}
          >
            {label}
          </Link>
        ))}
        </div>
        <div className="ml-auto flex min-w-0 max-w-full items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              <span aria-hidden="true" className="cb-title hidden size-8 shrink-0 place-items-center rounded-full bg-[var(--sky)] text-xs font-semibold lg:grid">
                {(user.name.match(/[ก-ฮa-z0-9]/i)?.[0] ?? "?").toUpperCase()}
              </span>
              <span className="hidden max-w-40 truncate text-sm font-medium lg:block" title={user.name}>{user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm whitespace-nowrap hover:bg-[var(--paper)]"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`rounded-full px-2.5 py-2 text-sm font-medium whitespace-nowrap ${pathname === "/login" ? "cb-title bg-[var(--sky)]" : "hover:bg-[var(--paper)]"}`}
              >
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="cb-primary px-3 py-2 text-sm font-medium whitespace-nowrap">
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
