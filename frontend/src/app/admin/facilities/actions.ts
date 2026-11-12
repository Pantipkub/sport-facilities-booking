"use server";

import { redirect } from "next/navigation";
import { api } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { SPORTS } from "@/libs/sports";

type Field = "name" | "sportType" | "location" | "capacity" | "hourlyRate";
export type FacilityFormState = {
  errors?: Partial<Record<Field, string>>;
  error?: string;
  values?: Record<Field, string>; // refill the form after an error
};

// id = undefined creates, otherwise updates
export async function saveFacility(
  id: string | undefined,
  _prev: FacilityFormState,
  formData: FormData,
): Promise<FacilityFormState> {
  const user = await requireUser("admin");
  const get = (key: Field) => String(formData.get(key) ?? "").trim();
  const values = {
    name: get("name"),
    sportType: get("sportType"),
    location: get("location"),
    capacity: get("capacity"),
    hourlyRate: get("hourlyRate"),
  };
  const capacity = Number(values.capacity);
  const hourlyRate = Number(values.hourlyRate);

  const errors: FacilityFormState["errors"] = {};
  if (!values.name) errors.name = "กรุณากรอกชื่อสนาม";
  if (!(values.sportType in SPORTS)) errors.sportType = "กรุณาเลือกประเภทกีฬา";
  if (!values.location) errors.location = "กรุณากรอกสถานที่";
  if (!Number.isInteger(capacity) || capacity < 1) errors.capacity = "ความจุต้องเป็นจำนวนเต็มตั้งแต่ 1 คนขึ้นไป";
  if (!values.hourlyRate || !Number.isFinite(hourlyRate) || hourlyRate < 0)
    errors.hourlyRate = "ราคาต้องเป็นตัวเลขตั้งแต่ 0 บาทขึ้นไป";
  if (Object.keys(errors).length) return { errors, values };

  const result = await api(id ? `/facilities/${id}` : "/facilities", {
    method: id ? "PUT" : "POST",
    body: { ...values, capacity, hourlyRate },
    token: user.token,
  });
  if (!result.ok) {
    // "Facility name already exists" after B1, raw Mongo E11000 before it (deleted facilities keep their names)
    if (/already exists|E11000/i.test(result.error)) return { values, errors: { name: "ชื่อสนามนี้ถูกใช้แล้ว กรุณาใช้ชื่ออื่น" } };
    return { values, error: "บันทึกข้อมูลสนามไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
  redirect("/admin/facilities?done=saved");
}

// Soft delete on the backend (isActive: false): existing bookings stay
export async function deleteFacility(id: string) {
  const user = await requireUser("admin");
  const result = await api(`/facilities/${id}`, { method: "DELETE", token: user.token });
  if (!result.ok) throw new Error(result.error);
  redirect("/admin/facilities?done=deleted");
}
