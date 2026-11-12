import Link from "next/link";
import Alert from "@/components/Alert";
import FacilityImage from "@/components/FacilityImage";
import SportBadge from "@/components/SportBadge";
import { api } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { baht } from "@/libs/format";
import type { Facility } from "@/types";

const MESSAGES: Record<string, string> = {
  saved: "บันทึกข้อมูลสนามเรียบร้อยแล้ว",
  deleted: "ลบสนามเรียบร้อยแล้ว",
};

export default async function AdminFacilitiesPage({ searchParams }: PageProps<"/admin/facilities">) {
  await requireUser("admin");
  const [{ done }, result] = await Promise.all([searchParams, api<Facility[]>("/facilities")]);
  const message = typeof done === "string" ? MESSAGES[done] : undefined;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">จัดการสนาม</h1>
          {result.ok && <p className="mt-1 text-stone-500">{result.data.length} สนามที่เปิดให้จอง</p>}
        </div>
        <Link
          href="/admin/facilities/new"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-stone-900 px-5 text-sm font-medium text-white hover:bg-stone-700"
        >
          + เพิ่มสนาม
        </Link>
      </div>
      {message && (
        <div className="mt-6">
          <Alert variant="success">{message}</Alert>
        </div>
      )}
      {!result.ok ? (
        <div className="mt-6">
          <Alert variant="error">โหลดรายการสนามไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</Alert>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
              <tr>
                <th className="w-24 px-5 py-3 font-medium">รูป</th>
                <th className="px-5 py-3 font-medium">ชื่อสนาม</th>
                <th className="px-5 py-3 font-medium">ประเภท</th>
                <th className="px-5 py-3 font-medium">สถานที่</th>
                <th className="px-5 py-3 text-right font-medium">ความจุ</th>
                <th className="px-5 py-3 text-right font-medium">ราคา / ชม.</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {result.data.map((f) => (
                <tr key={f._id}>
                  <td className="px-5 py-3">
                    <div className="w-16 overflow-hidden rounded-md">
                      <FacilityImage facility={f} small />
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium">
                    <Link href={`/facilities/${f._id}`} className="hover:underline">
                      {f.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <SportBadge sportType={f.sportType} />
                  </td>
                  <td className="px-5 py-4 text-stone-600">{f.location}</td>
                  <td className="px-5 py-4 text-right">{f.capacity} คน</td>
                  <td className="px-5 py-4 text-right font-medium">{baht(f.hourlyRate)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <Link href={`/admin/facilities/${f._id}/edit`} className="rounded-lg px-3 py-1.5 text-stone-700 hover:bg-stone-100">
                      แก้ไข
                    </Link>
                  </td>
                </tr>
              ))}
              {result.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-stone-500">
                    ยังไม่มีสนาม กด &quot;เพิ่มสนาม&quot; เพื่อเริ่มต้น
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
