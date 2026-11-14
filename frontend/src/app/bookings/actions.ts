"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { canEnd, canStart } from "@/libs/booking-time";
import { bangkokNow, toMinutes } from "@/libs/format";

export type BookingFormState = { error?: string };

export async function createBooking(_previous: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const user = await requireUser("member");
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const facility = text("facility");
  const bookingDate = text("bookingDate");
  const startTime = text("startTime");
  const durationHours = Number(text("durationHours"));

  if (!/^[a-f\d]{24}$/i.test(facility)) return { error: "ไม่พบสนามที่ต้องการจอง กรุณาเปิดหน้าสนามใหม่" };
  if (!/^([01]\d|2[0-3]):(00|30)$/.test(startTime)) return { error: "กรุณาเลือกเวลาเริ่มและเวลาสิ้นสุด" };
  const start = toMinutes(startTime);
  if (!canStart(start, bookingDate, bangkokNow())) return { error: "กรุณาเลือกวันที่และเวลาเริ่มที่ยังไม่ผ่านไป" };
  if (!Number.isFinite(durationHours) || !canEnd(start, start + durationHours * 60)) {
    return { error: "กรุณาเลือกช่วงเวลา 30 นาทีถึง 2 ชั่วโมง และสิ้นสุดภายในวันเดียวกัน" };
  }

  const result = await api("/bookings", {
    method: "POST",
    body: { facility, bookingDate, startTime, durationHours },
    token: user.token,
  });
  if (!result.ok) {
    if (result.status === 409) return { error: "ช่วงเวลานี้จองไม่ได้ สนามถูกจองแล้วหรือมีการจองที่เวลาซ้อนกัน กรุณาเลือกเวลาใหม่" };
    if (result.status === 401) return { error: "การเข้าสู่ระบบหมดอายุ กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่" };
    if (result.status === 403) return { error: "บัญชีนี้ไม่มีสิทธิ์จองสนาม" };
    if (result.status === 404) return { error: "สนามนี้ไม่เปิดให้จองแล้ว กรุณาเลือกสนามอื่น" };
    if (result.status === 400) return { error: "ข้อมูลการจองไม่ถูกต้อง กรุณาตรวจสอบวันที่และช่วงเวลาอีกครั้ง" };
    return { error: "จองสนามไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }

  revalidatePath("/bookings");
  revalidatePath("/admin");
  redirect("/bookings?created=1");
}
