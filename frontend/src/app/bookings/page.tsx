import Link from "next/link";
import Alert from "@/components/Alert";
import BookingList from "@/components/BookingList";
import { api } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { getErrorMessage } from "@/libs/errors";
import type { Booking } from "@/types";

const DELETE_ERRORS: Record<string, string> = {
  session: "การเข้าสู่ระบบหมดอายุ กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่",
  forbidden: "คุณไม่มีสิทธิ์ลบรายการจองนี้",
  missing: "ไม่พบรายการจองนี้ อาจถูกลบไปแล้ว",
  failed: "ลบการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
};

export default async function BookingsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const [query, result] = await Promise.all([searchParams, api<Booking[]>("/bookings", { token: user.token })]);
  const admin = user.role === "admin";
  const message = query.created === "1" ? "จองสนามเรียบร้อยแล้ว"
    : query.updated === "1" ? "แก้ไขการจองเรียบร้อยแล้ว"
      : query.deleted === "1" ? "ลบการจองเรียบร้อยแล้ว" : undefined;
  const deleteError = typeof query.deleteError === "string" && Object.hasOwn(DELETE_ERRORS, query.deleteError)
    ? DELETE_ERRORS[query.deleteError] : undefined;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{admin ? "การจองทั้งหมด" : "การจองของฉัน"}</h1>
          <p className="mt-1 text-stone-500">
            {admin ? "ดู แก้ไข หรือลบการจองของสมาชิกทุกคน" : result.ok ? `${result.data.length} รายการ` : "ดูและจัดการการจองของคุณ"}
          </p>
        </div>
        {!admin && <Link href="/" className="inline-flex h-11 items-center justify-center rounded-lg border border-stone-300 bg-white px-5 text-sm font-medium text-stone-700 hover:bg-stone-100">+ จองสนามเพิ่ม</Link>}
      </div>
      {message && !deleteError && <div className="mt-6"><Alert variant="success">{message}</Alert></div>}
      {deleteError && <div className="mt-6"><Alert variant="error">{deleteError}</Alert></div>}
      <div className="mt-6">
        {result.ok ? <BookingList bookings={result.data} admin={admin} /> : (
          <Alert variant="error">{getErrorMessage(result.error, result.status, "โหลดรายการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}</Alert>
        )}
      </div>
    </main>
  );
}
