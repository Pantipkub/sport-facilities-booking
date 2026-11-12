"use server";

import { redirect } from "next/navigation";
import { api } from "@/libs/api";
import { requireUser } from "@/libs/auth";

// Soft delete on the backend (isActive: false): existing bookings stay
export async function deleteFacility(id: string) {
  const user = await requireUser("admin");
  const result = await api(`/facilities/${id}`, { method: "DELETE", token: user.token });
  if (!result.ok) throw new Error(result.error);
  redirect("/");
}
