const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  TIME_SLOTS, EMPTY_RANGE, canStart, canEnd, normalizeTimeRange, timeCellState, selectTime, isBookingDate, durationText,
} = require("../src/libs/booking-time.ts");

const now = { date: "2026-11-15", minutes: 967 };
const tomorrow = "2026-11-16";

test("slots allow half-hour starts from 06:00 and midnight only as an end", () => {
  assert.equal(TIME_SLOTS.length, 37);
  assert.equal(TIME_SLOTS[0], 360);
  assert.equal(TIME_SLOTS.at(-1), 1440);
  assert.equal(canStart(360, tomorrow, now), true);
  assert.equal(canStart(350, tomorrow, now), false);
  assert.equal(canStart(370, tomorrow, now), false);
  assert.equal(canStart(1440, tomorrow, now), false);
  assert.equal(canEnd(1410, 1440), true);
  assert.equal(canEnd(1320, 1440), true);
  assert.equal(canEnd(1290, 1440), false);
});

test("past dates, elapsed times and invalid dates cannot start a booking", () => {
  assert.equal(canStart(960, now.date, now), false);
  assert.equal(canStart(990, now.date, now), true);
  assert.equal(canStart(990, "2026-11-14", now), false);
  assert.equal(canStart(990, "", now), false);
  assert.equal(isBookingDate("2026-02-30"), false);
  assert.equal(isBookingDate("2028-02-29"), true);
});

test("selection ends within two hours and another tap starts a new range", () => {
  const start = selectTime(960, EMPTY_RANGE, tomorrow, now);
  assert.deepEqual(start, { start: 960, end: null });
  assert.equal(timeCellState(1080, start, tomorrow, now), "endOk");
  assert.equal(timeCellState(1110, start, tomorrow, now), "later");
  const complete = selectTime(1050, start, tomorrow, now);
  assert.deepEqual(complete, { start: 960, end: 1050 });
  assert.equal(timeCellState(990, complete, tomorrow, now), "range");
  assert.deepEqual(selectTime(1080, complete, tomorrow, now), { start: 1080, end: null });
  assert.deepEqual(selectTime(1110, start, tomorrow, now), { start: 1110, end: null });
  assert.equal(canEnd(960, 960), false);
  assert.equal(canEnd(960, 975), false);
});

test("changing date or time availability clears only invalid selections", () => {
  const range = { start: 960, end: 1050 };
  assert.deepEqual(normalizeTimeRange(range, now.date, now), EMPTY_RANGE);
  assert.deepEqual(normalizeTimeRange(range, tomorrow, now), range);
  assert.deepEqual(normalizeTimeRange({ start: 960, end: 1110 }, tomorrow, now), EMPTY_RANGE);
});

test("busy periods distinguish court and owner conflicts while allowing adjacent endings", () => {
  const busy = { taken: [{ start: 1080, end: 1140 }], mine: [{ start: 840, end: 900 }] };
  assert.equal(timeCellState(1080, EMPTY_RANGE, tomorrow, now, busy), "taken");
  assert.equal(timeCellState(840, EMPTY_RANGE, tomorrow, now, busy), "mine");
  assert.equal(canEnd(960, 1080, busy), true);
  assert.equal(timeCellState(1080, { start: 960, end: null }, tomorrow, now, busy), "endOk");
  assert.equal(canEnd(1050, 1110, busy), false);
  assert.equal(canStart(1140, tomorrow, now, busy), true);
});

test("duration labels use Thai hours and minutes", () => {
  assert.equal(durationText(30), "30 นาที");
  assert.equal(durationText(90), "1 ชั่วโมง 30 นาที");
  assert.equal(durationText(120), "2 ชั่วโมง");
});
