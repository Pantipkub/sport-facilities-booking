"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import TimeRangePicker from "@/components/TimeRangePicker";
import { EMPTY_RANGE, durationText, normalizeTimeRange, type BookingClock, type TimeRange } from "@/libs/booking-time";
import { baht, bangkokNow, fromMinutes, toMinutes } from "@/libs/format";
import { sportOf } from "@/libs/sports";
import type { Booking, Facility } from "@/types";

const BTN = "inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium";
const INPUT = "mt-1.5 h-11 w-full rounded-lg border border-stone-300 bg-white px-3.5 text-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200";

type Props = {
  facility: Facility;
  booking?: Booking;
  facilities?: Facility[];
  initialNow: BookingClock;
};

export default function BookingFormFields({ facility, booking, facilities = [], initialNow }: Props) {
  const id = useId();
  const [now, setNow] = useState(initialNow);
  const [date, setDate] = useState(booking?.bookingDate.slice(0, 10) ?? initialNow.date);
  const [facilityId, setFacilityId] = useState(facility._id);
  const [selection, setSelection] = useState<TimeRange>(() => {
    if (!booking) return EMPTY_RANGE;
    const start = toMinutes(booking.startTime);
    return { start, end: start + booking.durationHours * 60 };
  });
  const options = [facility, ...facilities.filter((item) => item._id !== facility._id)];
  const currentFacility = options.find((item) => item._id === facilityId) ?? facility;
  const range = normalizeTimeRange(selection, date, now);
  const minutes = range.start !== null && range.end !== null ? range.end - range.start : 0;
  const time = range.start === null ? "ยังไม่ได้เลือก"
    : `${fromMinutes(range.start)} - ${range.end === null ? "?" : fromMinutes(range.end)}`;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(bangkokNow()), 15000);
    const updateClock = () => setNow(bangkokNow());
    window.addEventListener("focus", updateClock);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", updateClock);
    };
  }, []);

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="rounded-2xl border border-stone-200 bg-white p-6"
      aria-labelledby={`${id}-title`}
    >
      <h2 id={`${id}-title`} className="text-lg font-semibold">{booking ? "รายละเอียดการจอง" : "จองสนามนี้"}</h2>
      <input type="hidden" name="facility" value={facilityId} />
      <input type="hidden" name="startTime" value={range.start === null ? "" : fromMinutes(range.start)} />
      <input type="hidden" name="durationHours" value={minutes ? minutes / 60 : ""} />
      {booking && (
        <label className="mt-5 block">
          <span className="text-sm font-medium text-stone-900">สนาม</span>
          <select
            value={facilityId}
            onChange={(event) => {
              setFacilityId(event.target.value);
              setSelection(EMPTY_RANGE);
            }}
            className={INPUT}
          >
            {options.map((item) => <option key={item._id} value={item._id}>{item.name} ({sportOf(item.sportType).label})</option>)}
          </select>
        </label>
      )}
      <label className="mt-5 block">
        <span className="text-sm font-medium text-stone-900">1. วันที่</span>
        <input
          type="date"
          name="bookingDate"
          min={now.date}
          value={date}
          required
          onChange={(event) => {
            const nextDate = event.target.value;
            setDate(nextDate);
            setSelection((previous) => normalizeTimeRange(previous, nextDate, bangkokNow()));
          }}
          className={INPUT}
        />
      </label>
      <div className="mt-5">
        <TimeRangePicker date={date} now={now} value={range} onChange={setSelection} />
      </div>
      <div className="mt-5 space-y-2 rounded-xl bg-stone-50 p-4 text-sm" aria-live="polite">
        <div className="flex justify-between gap-3"><span className="text-stone-500">เวลา</span><span className="font-medium">{time}</span></div>
        <div className="flex justify-between gap-3"><span className="text-stone-500">รวม</span><span className="font-medium">{minutes ? durationText(minutes) : "-"}</span></div>
        <div className="flex justify-between gap-3"><span className="text-stone-500">ราคา</span><span className="text-base font-semibold">{minutes ? baht(currentFacility.hourlyRate * minutes / 60) : "-"}</span></div>
      </div>
      <div className="mt-5 flex gap-2">
        {booking && <Link href="/bookings" className={`${BTN} flex-1 border border-stone-300 bg-white text-stone-700 hover:bg-stone-100`}>ยกเลิก</Link>}
        <button type="submit" disabled className={`${BTN} flex-1 bg-stone-900 text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60`}>
          {booking ? "บันทึกการแก้ไข" : "ยืนยันการจอง"}
        </button>
      </div>
    </form>
  );
}
