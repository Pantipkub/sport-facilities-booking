export type TimeRange = { start: number | null; end: number | null };
export type BookingClock = { date: string; minutes: number };
export type BusyPeriod = { start: number; end: number };
export type BusyTimes = { taken?: BusyPeriod[]; mine?: BusyPeriod[] };
export type TimeCellState = "free" | "start" | "end" | "range" | "endOk" | "later" | "taken" | "mine" | "off";

export const EMPTY_RANGE: TimeRange = { start: null, end: null };
export const TIME_SLOTS = Array.from({ length: 37 }, (_, index) => 360 + index * 30);

export function isBookingDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

function isSlot(time: number) {
  return Number.isInteger(time) && time >= 360 && time <= 1440 && time % 30 === 0;
}

function overlaps(start: number, end: number, periods: BusyPeriod[] = []) {
  return periods.some((period) => start < period.end && end > period.start);
}

function blockedAt(time: number, busy: BusyTimes): "taken" | "mine" | null {
  if (overlaps(time, time + 30, busy.taken)) return "taken";
  if (overlaps(time, time + 30, busy.mine)) return "mine";
  return null;
}

export function canStart(time: number, date: string, now: BookingClock, busy: BusyTimes = {}) {
  return isSlot(time) && time < 1440 && isBookingDate(date) && date >= now.date
    && (date !== now.date || time >= now.minutes) && !blockedAt(time, busy);
}

export function canEnd(start: number, end: number, busy: BusyTimes = {}) {
  return isSlot(start) && start < 1440 && isSlot(end) && end > start && end - start <= 120
    && !overlaps(start, end, busy.taken) && !overlaps(start, end, busy.mine);
}

export function normalizeTimeRange(range: TimeRange, date: string, now: BookingClock, busy: BusyTimes = {}): TimeRange {
  if (range.start === null || !canStart(range.start, date, now, busy)) return EMPTY_RANGE;
  if (range.end !== null && !canEnd(range.start, range.end, busy)) return EMPTY_RANGE;
  return range;
}

export function timeCellState(time: number, range: TimeRange, date: string, now: BookingClock, busy: BusyTimes = {}): TimeCellState {
  if (time === range.start) return "start";
  if (time === range.end) return "end";
  if (range.start !== null && range.end !== null && time > range.start && time < range.end) return "range";
  if (range.start !== null && range.end === null && canEnd(range.start, time, busy)) return "endOk";
  if (!isBookingDate(date) || date < now.date || (date === now.date && time < now.minutes)) return "off";
  const blocked = blockedAt(time, busy);
  if (blocked) return blocked;
  if (!canStart(time, date, now, busy)) return "off";
  return range.start !== null && range.end === null ? "later" : "free";
}

export function selectTime(time: number, range: TimeRange, date: string, now: BookingClock, busy: BusyTimes = {}): TimeRange {
  if (range.start !== null && range.end === null && canEnd(range.start, time, busy)) return { start: range.start, end: time };
  return canStart(time, date, now, busy) ? { start: time, end: null } : range;
}

export function durationText(minutes: number) {
  return [
    Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)} ชั่วโมง` : "",
    minutes % 60 ? `${minutes % 60} นาที` : "",
  ].filter(Boolean).join(" ");
}
