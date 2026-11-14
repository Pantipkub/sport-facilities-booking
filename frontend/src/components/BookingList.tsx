"use client";

import Link from "next/link";
import { useId, useState } from "react";
import BookingTable from "@/components/BookingTable";
import { bookedFacilities, filterBookings } from "@/libs/booking-list";
import type { Booking } from "@/types";

const PRIMARY = "inline-flex h-11 items-center justify-center rounded-lg bg-stone-900 px-5 text-sm font-medium text-white hover:bg-stone-700";
const INPUT = "h-11 rounded-lg border border-stone-300 bg-white px-3.5 text-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200";

export default function BookingList({ bookings, admin }: { bookings: Booking[]; admin: boolean }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const facilities = bookedFacilities(bookings);
  const activeFacility = facilities.some((facility) => facility.id === facilityId) ? facilityId : "";
  const filtered = admin ? filterBookings(bookings, query, activeFacility) : bookings;

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
        <h2 className="text-lg font-semibold">{admin ? "ยังไม่มีการจองในระบบ" : "ยังไม่มีการจอง"}</h2>
        <p className="mt-1 text-sm text-stone-500">
          {admin ? "รายการจะแสดงที่นี่เมื่อสมาชิกจองสนาม" : "เลือกสนามที่สนใจแล้วจองเวลาที่สะดวกได้เลย"}
        </p>
        <Link href="/" className={`${PRIMARY} mt-5`}>ดูสนามทั้งหมด</Link>
      </div>
    );
  }

  return (
    <div>
      {admin && (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1 sm:max-w-72" htmlFor={`${id}-search`}>
            <span className="sr-only">ค้นหาชื่อหรืออีเมลผู้จอง</span>
            <input id={`${id}-search`} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อหรืออีเมลผู้จอง" className={`${INPUT} w-full`} />
          </label>
          <label className="min-w-0" htmlFor={`${id}-facility`}>
            <span className="sr-only">กรองตามสนาม</span>
            <select id={`${id}-facility`} value={activeFacility} onChange={(event) => setFacilityId(event.target.value)} className={`${INPUT} max-w-full`}>
              <option value="">ทุกสนาม</option>
              {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
            </select>
          </label>
          <span className="ml-auto self-center text-sm text-stone-500" aria-live="polite">{filtered.length} รายการ</span>
        </div>
      )}
      {filtered.length ? <BookingTable bookings={filtered} admin={admin} /> : (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500" role="status">ไม่พบการจองที่ตรงกับตัวกรอง</p>
      )}
    </div>
  );
}
