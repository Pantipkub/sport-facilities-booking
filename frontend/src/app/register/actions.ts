"use server";

import { redirect } from "next/navigation";
import { api } from "@/libs/api";

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
  if (!values.name) errors.name = "กรุณากรอกชื่อ-นามสกุล";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  if (!/^\d{9,10}$/.test(values.tel)) errors.tel = "เบอร์โทรต้องเป็นตัวเลข 9 ถึง 10 หลัก";
  if (password.length < 6) errors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
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
