"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import Alert from "@/components/Alert";
import { register, type RegisterState } from "./actions";
import { registerFieldError, type RegisterField } from "@/libs/register-validation";

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
  const [state, action, pending] = useActionState<RegisterState & { submits: number }, FormData>(
    async (previous, data) => ({ ...(await register(previous, data)), submits: previous.submits + 1 }),
    { submits: 0 },
  );

  return <RegisterFields key={state.submits} state={state} action={action} pending={pending} />;
}

function RegisterFields({ state, action, pending }: {
  state: RegisterState;
  action: (data: FormData) => void;
  pending: boolean;
}) {
  const id = useId();
  const [errors, setErrors] = useState<RegisterState["errors"]>(state.errors ?? {});
  const [checked, setChecked] = useState<Partial<Record<RegisterField, boolean>>>(
    Object.fromEntries(Object.keys(state.errors ?? {}).map((field) => [field, true])),
  );
  const [edited, setEdited] = useState(false);

  function validate(field: RegisterField, value: string) {
    setChecked((previous) => ({ ...previous, [field]: true }));
    setErrors((previous) => ({ ...previous, [field]: registerFieldError(field, value) }));
  }

  return (
    <main className="cb-grid-paper mt-6 grid place-items-center px-4 py-14">
      <div className="w-full max-w-md cb-paper cb-ticket p-5 sm:p-8">
        <h1 className="cb-title text-2xl font-semibold tracking-tight">สมัครสมาชิก</h1>
        <p className="mt-1 text-sm text-stone-500">สร้างบัญชีเพื่อเริ่มจองสนามกีฬา</p>
        {state.error && !edited && (
          <div className="mt-5">
            <Alert variant="error">{state.error}</Alert>
          </div>
        )}
        <form action={action} noValidate className="mt-6 space-y-4" onSubmit={(event) => {
          const data = new FormData(event.currentTarget);
          const nextErrors: NonNullable<RegisterState["errors"]> = {};
          for (const { name } of FIELDS) {
            const error = registerFieldError(name, String(data.get(name) ?? ""));
            if (error) nextErrors[name] = error;
          }
          setChecked({ name: true, email: true, tel: true, password: true });
          setErrors(nextErrors);
          const firstInvalid = FIELDS.find(({ name }) => nextErrors[name]);
          if (firstInvalid) {
            event.preventDefault();
            const input = event.currentTarget.elements.namedItem(firstInvalid.name);
            if (input instanceof HTMLInputElement) input.focus();
          }
        }}>
          {FIELDS.map((f) => {
            const error = errors?.[f.name];
            return (
              <label key={f.name} className="block">
                <span className={LABEL}>{f.label}</span>
                <input
                  name={f.name}
                  type={f.type}
                  placeholder={f.placeholder}
                  autoComplete={f.autoComplete}
                  disabled={pending}
                  defaultValue={f.name === "password" ? undefined : state.values?.[f.name]}
                  onBlur={(event) => validate(f.name, event.currentTarget.value)}
                  onChange={(event) => {
                    setEdited(true);
                    if (checked[f.name]) validate(f.name, event.currentTarget.value);
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${id}-${f.name}-error` : undefined}
                  className={`${INPUT} ${error ? "border-red-400" : "border-stone-300"}`}
                />
                {error && <span id={`${id}-${f.name}-error`} className="mt-1 block text-xs text-red-600" aria-live="polite">{error}</span>}
              </label>
            );
          })}
          <button
            disabled={pending}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg cb-primary px-5 text-sm font-medium disabled:opacity-60"
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
