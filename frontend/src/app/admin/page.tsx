import Link from "next/link";
import Alert from "@/components/Alert";
import StatCard from "@/components/StatCard";
import { api } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { bangkokNow, baht, endTime, thaiDate, toMinutes } from "@/libs/format";
import type { Booking, Facility } from "@/types";

export default async function DashboardPage() {
  const user = await requireUser("admin");
  const [bookings, facilities] = await Promise.all([
    api<Booking[]>("/bookings", { token: user.token }), // admin gets everyone's bookings
    api<Facility[]>("/facilities"),
  ]);
  const now = bangkokNow();

  if (!bookings.ok || !facilities.ok) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">ภาพรวม</h1>
        <div className="mt-6">
          <Alert variant="error">โหลดข้อมูลภาพรวมไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</Alert>
        </div>
      </main>
    );
  }

  const dateOf = (b: Booking) => b.bookingDate.slice(0, 10);
  const isUpcoming = (b: Booking) =>
    dateOf(b) > now.date || (dateOf(b) === now.date && toMinutes(b.startTime) >= now.minutes);
  const today = bookings.data.filter((b) => dateOf(b) === now.date);
  const upcoming = bookings.data.filter(isUpcoming);
  const revenue = upcoming.reduce((sum, b) => sum + (b.facility?.hourlyRate ?? 0) * b.durationHours, 0);
  const sportCount = new Set(facilities.data.map((f) => f.sportType)).size;

  // Hours booked per facility from today to 6 days ahead (string compare works on YYYY-MM-DD)
  const weekEnd = new Date(Date.parse(`${now.date}T00:00:00Z`) + 6 * 864e5).toISOString().slice(0, 10);
  const hours = facilities.data
    .map((f) => ({
      facility: f,
      hours: bookings.data
        .filter((b) => b.facility?._id === f._id && dateOf(b) >= now.date && dateOf(b) <= weekEnd)
        .reduce((sum, b) => sum + b.durationHours, 0),
    }))
    .sort((a, b) => b.hours - a.hours);
  const maxHours = Math.max(1, ...hours.map((h) => h.hours));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">ภาพรวม</h1>
      <p className="mt-1 text-stone-500">
        {thaiDate(now.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="การจองวันนี้"
          value={today.length}
          note={`${today.filter(isUpcoming).length} รายการยังไม่ถึงเวลา`}
        />
        <StatCard label="การจองที่กำลังจะมาถึง" value={upcoming.length} note="นับจากตอนนี้เป็นต้นไป" />
        <StatCard label="รายได้คาดการณ์" value={baht(revenue)} note="จากการจองที่กำลังจะมาถึง" />
        <StatCard label="สนามที่เปิดให้จอง" value={facilities.data.length} note={`${sportCount} ประเภทกีฬา`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold">ชั่วโมงที่ถูกจอง 7 วันข้างหน้า</h2>
          <p className="text-sm text-stone-500">
            {thaiDate(now.date, { day: "numeric", month: "short" })} ถึง {thaiDate(weekEnd, { day: "numeric", month: "short" })}
          </p>
          <div className="mt-5 space-y-3">
            {hours.map(({ facility, hours: h }) => (
              <div key={facility._id} className="grid grid-cols-[150px_1fr_56px] items-center gap-3 text-sm">
                <span className="truncate">{facility.name}</span>
                <div className="h-2.5 rounded-full bg-stone-100">
                  <div className="h-2.5 rounded-full bg-stone-900" style={{ width: `${(h / maxHours) * 100}%` }} />
                </div>
                <span className="text-right text-stone-500">{h} ชม.</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">การจองวันนี้</h2>
            <Link href="/bookings" className="text-sm text-stone-500 hover:text-stone-900">
              ดูทั้งหมด →
            </Link>
          </div>
          {today.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
              วันนี้ยังไม่มีการจอง
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-stone-100">
              {today.map((b) => {
                const up = isUpcoming(b);
                return (
                  <li key={b._id} className="flex items-center gap-4 py-3 text-sm">
                    <span className="w-28 font-medium">
                      {b.startTime} - {endTime(b.startTime, b.durationHours)}
                    </span>
                    <span className="flex-1">
                      <span className="font-medium">{b.facility?.name ?? "สนามที่ถูกลบ"}</span>
                      <span className="block text-xs text-stone-500">{b.user?.name}</span>
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${up ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"}`}
                    >
                      {up ? "กำลังจะมาถึง" : "ผ่านไปแล้ว"}
                    </span>
                    <Link href={`/bookings/${b._id}/edit`} className="rounded-lg px-2 py-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900">
                      แก้ไข
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
