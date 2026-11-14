"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useState } from "react";
import { createBooking, type BookingFormState } from "@/app/bookings/actions";
import Alert from "@/components/Alert";
import TimeRangePicker from "@/components/TimeRangePicker";
import { EMPTY_RANGE, durationText, normalizeTimeRange, validateBookingInput, type BookingClock, type BookingInputErrors, type TimeRange } from "@/libs/booking-time";
import { baht, bangkokNow, fromMinutes, toMinutes } from "@/libs/format";
import { sportOf } from "@/libs/sports";
import type { Booking, Facility } from "@/types";

const BTN = "inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium";
const INPUT = "mt-1.5 h-11 w-full rounded-lg border bg-white px-3.5 text-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200";

type Props = {
  facility?: Facility;
  booking?: Booking;
  facilities?: Facility[];
  initialNow: BookingClock;
  action?: (previous: BookingFormState, formData: FormData) => Promise<BookingFormState>;
};

type FormResult = BookingFormState & {
  submits: number;
  values?: { date: string; facility: string; start: string; duration: string };
};

export default function BookingFormFields(props: Props) {
  const [state, formAction, pending] = useActionState<FormResult, FormData>(async (previous, formData) => {
    const values = {
      date: String(formData.get("bookingDate") ?? ""),
      facility: String(formData.get("facility") ?? ""),
      start: String(formData.get("startTime") ?? ""),
      duration: String(formData.get("durationHours") ?? ""),
    };
    const result = await (props.action ?? createBooking)(previous, formData);
    return { ...result, values, submits: previous.submits + 1 };
  }, { submits: 0 });

  return <BookingFields key={state.submits} {...props} state={state} formAction={formAction} pending={pending} />;
}

function BookingFields({ facility, booking, facilities = [], initialNow, action, state, formAction, pending }: Props & {
  state: FormResult;
  formAction: (data: FormData) => void;
  pending: boolean;
}) {
  const id = useId();
  const [now, setNow] = useState(initialNow);
  const [date, setDate] = useState(state.values?.date ?? booking?.bookingDate.slice(0, 10) ?? initialNow.date);
  const [facilityId, setFacilityId] = useState(() => {
    if (!booking) return facility?._id ?? "";
    const selected = state.values?.facility ?? booking.facility?._id;
    return facilities.some((item) => item._id === selected) ? selected ?? "" : "";
  });
  const [clientErrors, setClientErrors] = useState<BookingInputErrors>({});
  const [edited, setEdited] = useState(false);
  const [selection, setSelection] = useState<TimeRange>(() => {
    if (state.values?.start) {
      const start = toMinutes(state.values.start);
      return { start, end: start + Number(state.values.duration) * 60 };
    }
    if (!booking) return EMPTY_RANGE;
    const start = toMinutes(booking.startTime);
    return { start, end: start + booking.durationHours * 60 };
  });
  const currentFacility = booking ? facilities.find((item) => item._id === facilityId) : facility;
  const range = normalizeTimeRange(selection, date, now);
  const minutes = range.start !== null && range.end !== null ? range.end - range.start : 0;
  const time = range.start === null ? "ยังไม่ได้เลือก"
    : `${fromMinutes(range.start)} - ${range.end === null ? "?" : fromMinutes(range.end)}`;
  const errors = { ...(edited ? {} : state.errors), ...clientErrors };

  function changeDate(nextDate: string) {
    setDate(nextDate);
    setSelection(normalizeTimeRange(range, nextDate, bangkokNow()));
    setClientErrors({});
    setEdited(true);
  }

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
      action={formAction}
      noValidate
      onSubmit={(event) => {
        const data = new FormData(event.currentTarget);
        const inputErrors = validateBookingInput({
          facility: String(data.get("facility") ?? ""),
          bookingDate: String(data.get("bookingDate") ?? ""),
          startTime: String(data.get("startTime") ?? ""),
          durationHours: String(data.get("durationHours") ?? ""),
        }, bangkokNow());
        setClientErrors(inputErrors);
        if (Object.keys(inputErrors).length) event.preventDefault();
      }}
      onReset={(event) => event.preventDefault()}
      className="rounded-2xl border border-stone-200 bg-white p-6"
      aria-labelledby={`${id}-title`}
      aria-busy={pending}
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
            disabled={pending}
            onChange={(event) => {
              setFacilityId(event.target.value);
              setSelection(EMPTY_RANGE);
              setClientErrors({});
              setEdited(true);
            }}
            aria-invalid={!!errors.facility}
            aria-describedby={errors.facility ? `${id}-facility-error` : undefined}
            className={`${INPUT} ${errors.facility ? "border-red-400" : "border-stone-300"}`}
          >
            <option value="" disabled>เลือกสนาม</option>
            {facilities.map((item) => <option key={item._id} value={item._id}>{item.name} ({sportOf(item.sportType).label})</option>)}
          </select>
          {!facilityId && !errors.facility && <span className="mt-1 block text-xs text-stone-500">สนามเดิมไม่เปิดให้จองแล้ว กรุณาเลือกสนามใหม่</span>}
          {errors.facility && <span id={`${id}-facility-error`} className="mt-1 block text-xs text-red-600" role="alert">{errors.facility}</span>}
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
          disabled={pending}
          aria-invalid={!!errors.bookingDate}
          aria-describedby={errors.bookingDate ? `${id}-date-error` : undefined}
          onInput={(event) => changeDate(event.currentTarget.value)}
          onChange={(event) => changeDate(event.target.value)}
          className={`${INPUT} ${errors.bookingDate ? "border-red-400" : "border-stone-300"}`}
        />
        {errors.bookingDate && <span id={`${id}-date-error`} className="mt-1 block text-xs text-red-600" role="alert">{errors.bookingDate}</span>}
      </label>
      <div className="mt-5">
        <TimeRangePicker date={date} now={now} value={range} onChange={(nextRange) => {
          setSelection(nextRange);
          setClientErrors({});
          setEdited(true);
        }} disabled={pending} invalid={!!errors.time} errorId={errors.time ? `${id}-time-error` : undefined} />
        {errors.time && <p id={`${id}-time-error`} className="mt-2 text-xs text-red-600" role="alert">{errors.time}</p>}
      </div>
      <div className="mt-5 space-y-2 rounded-xl bg-stone-50 p-4 text-sm" aria-live="polite">
        <div className="flex justify-between gap-3"><span className="text-stone-500">เวลา</span><span className="font-medium">{time}</span></div>
        <div className="flex justify-between gap-3"><span className="text-stone-500">รวม</span><span className="font-medium">{minutes ? durationText(minutes) : "-"}</span></div>
        <div className="flex justify-between gap-3"><span className="text-stone-500">ราคา</span><span className="text-base font-semibold">{minutes && currentFacility ? baht(currentFacility.hourlyRate * minutes / 60) : "-"}</span></div>
      </div>
      {state.error && !edited && <div className="mt-4"><Alert variant="error">{state.error}</Alert></div>}
      <div className="mt-5 flex gap-2">
        {booking && <Link href="/bookings" className={`${BTN} flex-1 border border-stone-300 bg-white text-stone-700 hover:bg-stone-100`}>ยกเลิก</Link>}
        <button type="submit" disabled={pending || (!!booking && !action)} className={`${BTN} flex-1 bg-stone-900 text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60`}>
          {pending ? "กำลังบันทึก" : booking ? "บันทึกการแก้ไข" : "ยืนยันการจอง"}
        </button>
      </div>
    </form>
  );
}
