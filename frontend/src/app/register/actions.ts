"use server";

import { redirect } from "next/navigation";
import { api } from "@/libs/api";
import { registerFieldError } from "@/libs/register-validation";

type Field = "name" | "email" | "tel" | "password";
export type RegisterState = {
  errors?: Partial<Record<Field, string>>;
  error?: string;
  values?: { name: string; email: string; tel: string }; // refill the form, never the password
};

export async function register(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const get = (key: Field) => String(formData.get(key) ?? "").trim();
  const values = { name: get("name"), email: get("email").toLowerCase(), tel: get("tel") };
  const password = String(formData.get("password") ?? "");

  const errors: RegisterState["errors"] = {};
  for (const field of ["name", "email", "tel", "password"] as const) {
    const error = registerFieldError(field, field === "password" ? password : values[field]);
    if (error) errors[field] = error;
  }
  if (Object.keys(errors).length) return { errors, values };

  const result = await api("/auth/register", { method: "POST", body: { ...values, password, role: "member" } });
  if (!result.ok) {
    // "Email already registered" after B1, raw Mongo E11000 before it
    const duplicate = /already registered|E11000/i.test(result.error);
    return {
      values,
      error: duplicate
        ? "อีเมลนี้ถูกใช้สมัครแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ"
        : "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    };
  }
  redirect(`/login?registered=1&email=${encodeURIComponent(values.email)}`);
}
