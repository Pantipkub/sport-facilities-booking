import Link from "next/link";
import Alert from "@/components/Alert";
import BookingForm from "@/components/BookingForm";
import { api } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { getErrorMessage } from "@/libs/errors";
import type { Booking, Facility } from "@/types";
import { updateBooking } from "../../actions";

export default async function EditBookingPage({ params }: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const admin = user.role === "admin";
  const booking = /^[a-f\d]{24}$/i.test(id)
    ? await api<Booking>(`/bookings/${id}`, { token: user.token })
    : { ok: false as const, error: "Booking not found", status: 404 };

  let form;
  if (!booking.ok) {
    form = <Alert variant="error">{getErrorMessage(booking.error, booking.status, "โหลดข้อมูลการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}</Alert>;
  } else {
    const facilities = await api<Facility[]>("/facilities");
    if (!facilities.ok) {
      form = <Alert variant="error">{getErrorMessage(facilities.error, facilities.status, "โหลดรายชื่อสนามไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}</Alert>;
    } else if (facilities.data.length === 0) {
      form = <Alert variant="error">ยังไม่มีสนามเปิดให้จอง กรุณาลองใหม่ภายหลัง</Alert>;
    } else {
      form = <BookingForm booking={booking.data} facilities={facilities.data} action={updateBooking.bind(null, id)} />;
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <Link href="/bookings" className="text-sm text-stone-500 hover:text-stone-900">
        ← {admin ? "การจองทั้งหมด" : "การจองของฉัน"}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">แก้ไขการจอง</h1>
      <p className="mt-1 text-stone-500">เปลี่ยนสนาม วัน หรือเวลาได้ ระบบจะตรวจเวลาซ้อนให้อีกครั้ง</p>
      {admin && booking.ok && (
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4 text-sm">
          <p className="font-medium">ผู้จอง: {booking.data.user?.name ?? "ไม่พบข้อมูลผู้จอง"}</p>
          {booking.data.user?.email && <p className="break-all text-stone-500">{booking.data.user.email}</p>}
        </div>
      )}
      <div className="mt-6">{form}</div>
    </main>
  );
}
