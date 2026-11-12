"use client";

import Link from "next/link";
import { useActionState } from "react";
import Alert from "@/components/Alert";
import { register, type RegisterState } from "./actions";

const LABEL = "text-sm font-medium text-stone-900";
const INPUT = // border color is set per field (normal or error)
  "mt-1.5 h-11 w-full rounded-lg border bg-white px-3.5 text-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200";

const FIELDS = [
  { name: "name", label: "ชื่อ-นามสกุล", type: "text", placeholder: "สมชาย ใจดี", autoComplete: "name" },
  { name: "email", label: "อีเมล", type: "email", placeholder: "name@example.com", autoComplete: "email" },
  { name: "tel", label: "เบอร์โทรศัพท์", type: "tel", placeholder: "0812345678", autoComplete: "tel" },
  { name: "password", label: "รหัสผ่าน", type: "password", placeholder: "อย่างน้อย 6 ตัวอักษร", autoComplete: "new-password" },
] as const;

export default function RegisterPage() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(register, {});

  return (
    <main className="grid place-items-center px-6 py-14">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">สมัครสมาชิก</h1>
        <p className="mt-1 text-sm text-stone-500">สร้างบัญชีเพื่อเริ่มจองสนามกีฬา</p>
        {state.error && (
          <div className="mt-5">
            <Alert variant="error">{state.error}</Alert>
          </div>
        )}
        <form action={action} noValidate className="mt-6 space-y-4">
          {FIELDS.map((f) => {
            const error = state.errors?.[f.name];
            return (
              <label key={f.name} className="block">
                <span className={LABEL}>{f.label}</span>
                <input
                  name={f.name}
                  type={f.type}
                  placeholder={f.placeholder}
                  autoComplete={f.autoComplete}
                  defaultValue={f.name === "password" ? undefined : state.values?.[f.name]}
                  aria-invalid={!!error}
                  className={`${INPUT} ${error ? "border-red-400" : "border-stone-300"}`}
                />
                {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
              </label>
            );
          })}
          <button
            disabled={pending}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-stone-900 px-5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
          >
            {pending ? "กำลังสมัครสมาชิก" : "สมัครสมาชิก"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-stone-500">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="font-medium text-stone-900 underline underline-offset-4 hover:text-stone-600">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </main>
  );
}
