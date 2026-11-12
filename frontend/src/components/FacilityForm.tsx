"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveFacility, type FacilityFormState } from "@/app/admin/facilities/actions";
import Alert from "@/components/Alert";
import { SPORTS } from "@/libs/sports";
import type { Facility } from "@/types";

const BTN = "inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium";
type Field = "name" | "sportType" | "location" | "capacity" | "hourlyRate";
const LABEL = "text-sm font-medium text-stone-900";
const INPUT = // border color is set per field (normal or error)
  "mt-1.5 h-11 w-full rounded-lg border bg-white px-3.5 text-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200";

// Create when `facility` is missing, edit otherwise
export default function FacilityForm({ facility }: { facility?: Facility }) {
  // `submits` counts results so the <select> can remount: React's post-action form reset
  // puts a select back on its first option instead of its defaultValue
  const [state, action, pending] = useActionState<FacilityFormState & { submits?: number }, FormData>(
    async (prev, formData) => ({
      ...(await saveFacility(facility?._id, prev, formData)),
      submits: (prev.submits ?? 0) + 1,
    }),
    {},
  );
  const props = (key: Field) => ({
    name: key,
    defaultValue: state.values?.[key] ?? (facility ? String(facility[key]) : ""),
    "aria-invalid": !!state.errors?.[key],
    className: `${INPUT} ${state.errors?.[key] ? "border-red-400" : "border-stone-300"}`,
  });
  const error = (key: Field) =>
    state.errors?.[key] && <span className="mt-1 block text-xs text-red-600">{state.errors[key]}</span>;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/admin/facilities" className="text-sm text-stone-500 hover:text-stone-900">
        ← จัดการสนาม
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{facility ? "แก้ไขสนาม" : "เพิ่มสนามใหม่"}</h1>
      <p className="mt-1 text-stone-500">
        {facility
          ? "แก้ไขข้อมูลแล้วกดบันทึก การจองเดิมของสนามนี้ยังอยู่"
          : "กรอกข้อมูลสนามให้ครบ สนามใหม่จะแสดงให้สมาชิกจองได้ทันที"}
      </p>
      {state.error && (
        <div className="mt-6">
          <Alert variant="error">{state.error}</Alert>
        </div>
      )}
      <form action={action} noValidate className="mt-8 space-y-5 rounded-2xl border border-stone-200 bg-white p-8">
        <label className="block">
          <span className={LABEL}>ชื่อสนาม</span>
          <input {...props("name")} placeholder="Badminton Court C" />
          {error("name")}
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={LABEL}>ประเภทกีฬา</span>
            <select key={state.submits} {...props("sportType")}>
              <option value="" disabled>
                เลือกประเภทกีฬา
              </option>
              {Object.entries(SPORTS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
            {error("sportType")}
          </label>
          <label className="block">
            <span className={LABEL}>สถานที่</span>
            <input {...props("location")} placeholder="สาขาสามย่าน ชั้น 2" />
            {error("location")}
          </label>
          <label className="block">
            <span className={LABEL}>ความจุ (คน)</span>
            <input {...props("capacity")} type="number" min={1} placeholder="4" />
            {error("capacity")}
          </label>
          <label className="block">
            <span className={LABEL}>ราคาต่อชั่วโมง (บาท)</span>
            <input {...props("hourlyRate")} type="number" min={0} placeholder="180" />
            {error("hourlyRate")}
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-stone-100 pt-5">
          <Link href="/admin/facilities" className={`${BTN} border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900`}>
            ยกเลิก
          </Link>
          <button disabled={pending} className={`${BTN} bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-60`}>
            {pending ? "กำลังบันทึก" : facility ? "บันทึกการแก้ไข" : "เพิ่มสนาม"}
          </button>
        </div>
      </form>
    </main>
  );
}
