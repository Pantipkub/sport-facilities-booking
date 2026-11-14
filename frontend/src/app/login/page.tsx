import Link from "next/link";
import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { registered, email } = await searchParams;

  return (
    <main className="cb-grid-paper mt-6 grid place-items-center px-4 py-16">
      <div className="w-full max-w-sm cb-paper cb-ticket p-5 sm:p-8">
        <h1 className="cb-title text-2xl font-semibold tracking-tight">เข้าสู่ระบบ</h1>
        <p className="mt-1 text-sm text-stone-500">ยินดีต้อนรับกลับ เข้าสู่ระบบเพื่อจองสนาม</p>
        <LoginForm registered={registered === "1"} email={typeof email === "string" ? email : ""} />
        <p className="mt-6 text-center text-sm text-stone-500">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="font-medium text-stone-900 underline underline-offset-4 hover:text-stone-600">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </main>
  );
}
