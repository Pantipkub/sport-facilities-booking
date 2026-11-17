"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useState } from "react";
import { createBooking, type BookingFormState } from "@/app/bookings/actions";
import Alert from "@/components/Alert";
import TimeRangePicker from "@/components/TimeRangePicker";
import "@/components/booking-scrapbook.css";
import { EMPTY_RANGE, durationText, isBookingDate, normalizeTimeRange, validateBookingInput, type BookingClock, type BookingInputErrors, type BusyTimes, type TimeRange } from "@/libs/booking-time";
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

type AvailabilityResult = { key: string; busy: BusyTimes } | { key: string; failed: true };

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
  const [availability, setAvailability] = useState<AvailabilityResult>();
  const [attempt, retryAvailability] = useState(0);
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
  const bookingId = booking?._id;
  const canLoad = Boolean(currentFacility) && isBookingDate(date) && date >= now.date;
  const availabilityKey = `${facilityId}:${date}:${attempt}`;
  const currentAvailability = availability?.key === availabilityKey ? availability : undefined;
  const busy = canLoad && currentAvailability && "busy" in currentAvailability ? currentAvailability.busy : undefined;
  const loading = canLoad && !currentAvailability;
  const failed = canLoad && Boolean(currentAvailability && "failed" in currentAvailability);
  const range = normalizeTimeRange(selection, date, now, busy);
  const minutes = range.start !== null && range.end !== null ? range.end - range.start : 0;
  const time = range.start === null ? "ยังไม่ได้เลือก"
    : `${fromMinutes(range.start)} - ${range.end === null ? "?" : fromMinutes(range.end)}`;
  const errors = { ...(edited ? {} : state.errors), ...clientErrors };

  function changeDate(nextDate: string) {
    if (nextDate === date) return;
    setDate(nextDate);
    setSelection(normalizeTimeRange(range, nextDate, bangkokNow()));
    retryAvailability((value) => value + 1);
    setClientErrors({});
    setEdited(true);
  }

  useEffect(() => {
    if (!canLoad) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ facility: facilityId, date });
    if (bookingId) query.set("exclude", bookingId);

    async function loadAvailability() {
      try {
        const response = await fetch(`/api/bookings/availability?${query}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Availability request failed");
        const busy: BusyTimes = await response.json();
        if (controller.signal.aborted) return;
        setAvailability({ key: availabilityKey, busy });
        setSelection((range) => normalizeTimeRange(range, date, bangkokNow(), busy));
      } catch {
        if (!controller.signal.aborted) setAvailability({ key: availabilityKey, failed: true });
      }
    }

    void loadAvailability();
    return () => controller.abort();
  }, [availabilityKey, bookingId, canLoad, date, facilityId]);

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
        if (loading || failed) {
          event.preventDefault();
          return;
        }
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
      className="p-4 sm:p-6 cb-booking-panel"
      aria-labelledby={`${id}-title`}
      aria-busy={pending}
    >
      <h2 id={`${id}-title`} className="text-xl font-semibold text-[var(--brand-dark)]">{booking ? "รายละเอียดการจอง" : "จองสนามนี้"}</h2>
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
              retryAvailability((value) => value + 1);
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
      <div className="mt-5 rounded-xl border border-[var(--line)] p-2.5 sm:p-3 cb-booking-graph">
        <TimeRangePicker date={date} now={now} value={range} busy={busy} onChange={(nextRange) => {
          setSelection(nextRange);
          setClientErrors({});
          setEdited(true);
        }} disabled={pending || !busy} loading={loading} failed={failed} invalid={!!errors.time} errorId={errors.time ? `${id}-time-error` : undefined} />
        {failed && (
          <button type="button" className="mt-2 text-sm font-medium text-stone-700 underline" onClick={() => retryAvailability((value) => value + 1)}>
            โหลดช่วงเวลาอีกครั้ง
          </button>
        )}
        {errors.time && <p id={`${id}-time-error`} className="mt-2 text-xs text-red-600" role="alert">{errors.time}</p>}
      </div>
      <div className="mt-5 space-y-2 p-4 text-sm cb-booking-summary" aria-live="polite">
        <div className="flex justify-between gap-3"><span className="text-stone-500">เวลา</span><span className="font-medium">{time}</span></div>
        <div className="flex justify-between gap-3"><span className="text-stone-500">รวม</span><span className="font-medium">{minutes ? durationText(minutes) : "-"}</span></div>
        <div className="flex justify-between gap-3"><span className="text-stone-500">ราคา</span><span className="text-base font-semibold">{minutes && currentFacility ? baht(currentFacility.hourlyRate * minutes / 60) : "-"}</span></div>
      </div>
      {state.error && !edited && <div className="mt-4"><Alert variant="error">{state.error}</Alert></div>}
      <div className="mt-5 flex gap-2">
        {booking && <Link href="/bookings" className={`${BTN} flex-1 border border-stone-300 bg-white text-stone-700 hover:bg-stone-100`}>ยกเลิก</Link>}
        <button type="submit" disabled={pending || loading || failed || (!!booking && !action)} className={`${BTN} flex-1 disabled:cursor-not-allowed disabled:opacity-60 cb-booking-primary`}>
          {pending ? "กำลังบันทึก" : booking ? "บันทึกการแก้ไข" : "ยืนยันการจอง"}
        </button>
      </div>
    </form>
  );
}
