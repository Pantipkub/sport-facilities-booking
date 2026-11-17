"use client";

import { useId } from "react";
import "@/components/booking-scrapbook.css";
import { fromMinutes } from "@/libs/format";
import {
  TIME_SLOTS, canEnd, normalizeTimeRange, selectTime, timeCellState,
  type BookingClock, type BusyTimes, type TimeCellState, type TimeRange,
} from "@/libs/booking-time";

const CELL: Record<TimeCellState, string> = {
  free: "text-stone-900 hover:bg-stone-100",
  start: "cb-booking-selected",
  end: "cb-booking-selected",
  range: "cb-booking-selected-range",
  endOk: "text-stone-900 ring-1 ring-inset ring-stone-400 hover:bg-stone-100",
  later: "text-stone-500 hover:bg-stone-100",
  taken: "bg-stone-200 text-stone-600 line-through cursor-not-allowed",
  mine: "bg-amber-100 text-amber-900 line-through cursor-not-allowed",
  off: "text-stone-300 cursor-not-allowed",
};

const TITLES: Partial<Record<TimeCellState, string>> = {
  start: "เวลาเริ่มต้น",
  end: "เวลาสิ้นสุด",
  endOk: "จบที่เวลานี้ได้",
  later: "ว่าง แตะเพื่อเริ่มใหม่ที่เวลานี้",
  taken: "ถูกจองแล้ว",
  mine: "คุณมีจองที่อื่นเวลานี้",
};

type Props = {
  date: string;
  now: BookingClock;
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  busy?: BusyTimes;
  disabled?: boolean;
  loading?: boolean;
  failed?: boolean;
  invalid?: boolean;
  errorId?: string;
};

export default function TimeRangePicker({ date, now, value, onChange, busy = {}, disabled = false, loading = false, failed = false, invalid = false, errorId }: Props) {
  const id = useId();
  const range = normalizeTimeRange(value, date, now, busy);
  const maxEnd = range.start === null ? null : TIME_SLOTS.filter((time) => canEnd(range.start!, time, busy)).at(-1);
  const hint = loading ? "กำลังโหลดช่วงเวลาว่าง"
    : failed ? "โหลดช่วงเวลาว่างไม่สำเร็จ"
    : !date ? "เลือกวันที่ก่อนเลือกเวลา"
    : range.start === null ? "แตะเวลาที่ต้องการเริ่มเล่น"
      : range.end === null ? `เริ่ม ${fromMinutes(range.start)} แตะเวลาสิ้นสุด (ได้ถึง ${fromMinutes(maxEnd ?? range.start)})`
        : "แตะเวลาอื่นเพื่อเลือกใหม่";

  return (
    <div role="group" aria-labelledby={`${id}-label`} aria-describedby={[`${id}-hint`, errorId].filter(Boolean).join(" ")}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <span id={`${id}-label`} className="text-sm font-medium text-stone-900">2. เลือกเวลาเริ่ม แล้วเลือกเวลาสิ้นสุด</span>
        <span className="text-xs text-stone-600">สูงสุด 2 ชั่วโมง</span>
      </div>
      <p id={`${id}-hint`} aria-live="polite" className="mt-1 text-xs text-stone-500">{hint}</p>
      <div className={`mt-2 grid grid-cols-4 gap-y-1 min-[360px]:grid-cols-5 min-[420px]:grid-cols-6 ${invalid ? "rounded-lg ring-1 ring-red-400" : ""}`}>
        {TIME_SLOTS.map((time) => {
          const state = timeCellState(time, range, date, now, busy);
          const band = state === "range" ? "bg-[#e2ead0]"
            : state === "start" && range.end !== null ? "bg-[linear-gradient(to_right,transparent_50%,#e2ead0_50%)]"
              : state === "end" ? "bg-[linear-gradient(to_right,#e2ead0_50%,transparent_50%)]" : "";
          const title = TITLES[state] ?? (state === "off"
            ? time === 1440 ? "ใช้เป็นเวลาสิ้นสุดเท่านั้น" : "ยังไม่ได้เลือกวันที่หรือเลยเวลาแล้ว"
            : "แตะเพื่อเลือกเวลา");
          return (
            <div key={time} className={`flex min-h-11 items-center justify-center ${band}`}>
              <button
                type="button"
                title={title}
                aria-label={`${fromMinutes(time)} ${title}`}
                aria-pressed={state === "start" || state === "end"}
                disabled={disabled || state === "taken" || state === "mine" || state === "off"}
                onClick={() => onChange(selectTime(time, range, date, now, busy))}
                className={`min-h-11 w-full max-w-12 rounded-lg text-[13px] font-medium focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:cursor-not-allowed ${CELL[state]}`}
              >
                {fromMinutes(time)}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500">
        <span className="flex items-center gap-1.5"><i aria-hidden="true" className="size-3 rounded cb-booking-selected" />เริ่ม / สิ้นสุด</span>
        <span className="flex items-center gap-1.5"><i aria-hidden="true" className="h-3 w-5 cb-booking-selected-range" />ช่วงที่เลือก</span>
        <span className="flex items-center gap-1.5"><i aria-hidden="true" className="size-3 rounded ring-1 ring-inset ring-stone-400" />จบได้</span>
        {busy.taken && <span className="flex items-center gap-1.5"><s className="rounded bg-stone-200 px-1 text-stone-600">12:00</s>ถูกจองแล้ว</span>}
        {busy.mine && <span className="flex items-center gap-1.5"><s className="rounded bg-amber-100 px-1 text-amber-900">14:00</s>คุณมีจองที่อื่น</span>}
      </div>
    </div>
  );
}
