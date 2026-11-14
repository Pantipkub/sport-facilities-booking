"use client";

import Link from "next/link";
import SportBadge from "@/components/SportBadge";
import { durationText } from "@/libs/booking-time";
import { baht, endTime, thaiDate } from "@/libs/format";
import type { Booking } from "@/types";

export default function BookingTable({ bookings, admin = false }: { bookings: Booking[]; admin?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{admin ? "รายการจองของสมาชิกทุกคน" : "รายการจองของฉัน"}</caption>
        <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
          <tr>
            {admin && <th scope="col" className="px-5 py-3 font-medium">ผู้จอง</th>}
            <th scope="col" className="px-5 py-3 font-medium">สนาม</th>
            <th scope="col" className="px-5 py-3 font-medium">วันที่</th>
            <th scope="col" className="px-5 py-3 font-medium">เวลา</th>
            <th scope="col" className="px-5 py-3 text-right font-medium">ราคา</th>
            <th scope="col" className="px-5 py-3"><span className="sr-only">จัดการการจอง</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {bookings.map((booking) => (
            <tr key={booking._id}>
              {admin && (
                <td className="px-5 py-4">
                  <div className="font-medium">{booking.user?.name ?? "ไม่พบข้อมูลผู้จอง"}</div>
                  <div className="text-xs text-stone-500">{booking.user?.email}</div>
                </td>
              )}
              <td className="px-5 py-4">
                {booking.facility ? (
                  <>
                    <Link href={`/facilities/${booking.facility._id}`} className="font-medium hover:underline">{booking.facility.name}</Link>
                    <div className="mt-1"><SportBadge sportType={booking.facility.sportType} /></div>
                  </>
                ) : <span className="font-medium">ไม่พบข้อมูลสนาม</span>}
              </td>
              <td className="whitespace-nowrap px-5 py-4">{thaiDate(booking.bookingDate)}</td>
              <td className="whitespace-nowrap px-5 py-4">
                {booking.startTime} - {endTime(booking.startTime, booking.durationHours)}
                <div className="text-xs text-stone-500">{durationText(booking.durationHours * 60)}</div>
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right font-medium">
                {booking.facility ? baht(booking.facility.hourlyRate * booking.durationHours) : "-"}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right">
                <Link href={`/bookings/${booking._id}/edit`} aria-label={`แก้ไขการจอง ${booking.facility?.name ?? "สนาม"} ${booking.startTime}`} className="inline-flex rounded-lg px-3 py-1.5 text-stone-700 hover:bg-stone-100">
                  แก้ไข
                </Link>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr><td colSpan={admin ? 6 : 5} className="px-5 py-10 text-center text-stone-500">ยังไม่มีการจอง</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
