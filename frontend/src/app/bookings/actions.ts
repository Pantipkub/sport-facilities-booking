"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { validateBookingInput, type BookingInput, type BookingInputErrors } from "@/libs/booking-time";
import { getErrorMessage } from "@/libs/errors";
import { bangkokNow } from "@/libs/format";

export type BookingFormState = { error?: string; errors?: BookingInputErrors };

function readBookingInput(formData: FormData): BookingInput {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  return {
    facility: text("facility"),
    bookingDate: text("bookingDate"),
    startTime: text("startTime"),
    durationHours: text("durationHours"),
  };
}

export async function createBooking(_previous: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const user = await requireUser("member");
  const input = readBookingInput(formData);
  const errors = validateBookingInput(input, bangkokNow());
  if (Object.keys(errors).length) return { errors };

  const result = await api("/bookings", {
    method: "POST",
    body: { ...input, durationHours: Number(input.durationHours) },
    token: user.token,
  });
  if (!result.ok) {
    return { error: getErrorMessage(result.error, result.status, "จองสนามไม่สำเร็จ กรุณาลองใหม่อีกครั้ง") };
  }

  revalidatePath("/bookings");
  revalidatePath("/admin");
  redirect("/bookings?created=1");
}

export async function updateBooking(id: string, _previous: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const user = await requireUser();
  if (!/^[a-f\d]{24}$/i.test(id)) return { error: getErrorMessage("Booking not found", 404) };

  const input = readBookingInput(formData);
  const errors = validateBookingInput(input, bangkokNow());
  if (Object.keys(errors).length) return { errors };

  const result = await api(`/bookings/${id}`, {
    method: "PUT",
    body: { ...input, durationHours: Number(input.durationHours) },
    token: user.token,
  });
  if (!result.ok) {
    return { error: getErrorMessage(result.error, result.status, "บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่อีกครั้ง") };
  }

  revalidatePath("/bookings");
  revalidatePath("/admin");
  redirect("/bookings?updated=1");
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
