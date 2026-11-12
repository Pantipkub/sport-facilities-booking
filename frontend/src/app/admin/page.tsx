import Alert from "@/components/Alert";
import StatCard from "@/components/StatCard";
import { api } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { bangkokNow, baht, thaiDate, toMinutes } from "@/libs/format";
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
    </main>
  );
}
