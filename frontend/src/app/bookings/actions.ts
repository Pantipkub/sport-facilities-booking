"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { validateBookingInput, type BookingInputErrors } from "@/libs/booking-time";
import { getErrorMessage } from "@/libs/errors";
import { bangkokNow } from "@/libs/format";

export type BookingFormState = { error?: string; errors?: BookingInputErrors };

export async function createBooking(_previous: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const user = await requireUser("member");
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const facility = text("facility");
  const bookingDate = text("bookingDate");
  const startTime = text("startTime");
  const rawDuration = text("durationHours");
  const errors = validateBookingInput({ facility, bookingDate, startTime, durationHours: rawDuration }, bangkokNow());
  if (Object.keys(errors).length) return { errors };
  const durationHours = Number(rawDuration);

  const result = await api("/bookings", {
    method: "POST",
    body: { facility, bookingDate, startTime, durationHours },
    token: user.token,
  });
  if (!result.ok) {
    return { error: getErrorMessage(result.error, result.status, "จองสนามไม่สำเร็จ กรุณาลองใหม่อีกครั้ง") };
  }

  revalidatePath("/bookings");
  revalidatePath("/admin");
  redirect("/bookings?created=1");
}

export async function deleteBooking(id: string): Promise<void> {
  const user = await requireUser();
  if (!/^[a-f\d]{24}$/i.test(id)) redirect("/bookings?deleteError=missing");

  const result = await api(`/bookings/${id}`, { method: "DELETE", token: user.token });
  if (!result.ok) {
    const reason = result.status === 401 ? "session"
      : result.status === 403 ? "forbidden"
        : result.status === 404 ? "missing" : "failed";
    redirect(`/bookings?deleteError=${reason}`);
  }

  revalidatePath("/bookings");
  revalidatePath("/admin");
  redirect("/bookings?deleted=1");
}
