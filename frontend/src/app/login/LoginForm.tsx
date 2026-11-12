"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import Alert from "@/components/Alert";

const LABEL = "text-sm font-medium text-stone-900";
const INPUT =
  "mt-1.5 h-11 w-full rounded-lg border border-stone-300 bg-white px-3.5 text-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200";

export default function LoginForm({ registered, email }: { registered: boolean; email: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: String(form.get("email")).trim().toLowerCase(), // backend stores emails in lowercase
      password: String(form.get("password")),
    });
    if (!res || res.error) {
      setError(res?.error === "CredentialsSignin" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setPending(false);
      return;
    }
    const session = await getSession();
    router.replace(session?.user.role === "admin" ? "/admin" : "/");
    router.refresh();
  }

  return (
    <>
      {(error || registered) && (
        <div className="mt-5">
          {error ? (
            <Alert variant="error">{error}</Alert>
          ) : (
            <Alert variant="success">สมัครสมาชิกเรียบร้อย เข้าสู่ระบบเพื่อเริ่มจองสนาม</Alert>
          )}
        </div>
      )}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className={LABEL}>อีเมล</span>
          <input name="email" type="email" required autoComplete="email" defaultValue={email} placeholder="name@example.com" className={INPUT} />
        </label>
        <label className="block">
          <span className={LABEL}>รหัสผ่าน</span>
          <input name="password" type="password" required autoComplete="current-password" placeholder="อย่างน้อย 6 ตัวอักษร" className={INPUT} />
        </label>
        <button
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-stone-900 px-5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
        >
          {pending ? "กำลังเข้าสู่ระบบ" : "เข้าสู่ระบบ"}
        </button>
      </form>
    </>
  );
}
