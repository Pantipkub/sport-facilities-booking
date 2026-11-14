const assert = require("node:assert/strict");
const { test } = require("node:test");
const { filterBookings, bookedFacilities } = require("../src/libs/booking-list.ts");

const bookings = [
  { _id: "b1", user: { name: "สมชาย ใจดี", email: "Somchai@example.com" }, facility: { _id: "f1", name: "สนามเทนนิส" } },
  { _id: "b2", user: { name: "มาลี รักกีฬา", email: "malee@example.com" }, facility: { _id: "f2", name: "สนามแบดมินตัน" } },
  { _id: "b3", user: { name: "สมชาย ใจดี", email: "Somchai@example.com" }, facility: { _id: "f2", name: "สนามแบดมินตัน" } },
];

test("admin search matches names and email regardless of case and surrounding spaces", () => {
  assert.deepEqual(filterBookings(bookings, " สมชาย ", "").map(b => b._id), ["b1", "b3"]);
  assert.deepEqual(filterBookings(bookings, "SOMCHAI@", "").map(b => b._id), ["b1", "b3"]);
  assert.deepEqual(filterBookings(bookings, "ไม่พบ", ""), []);
});

test("facility filters combine with owner search and do not change the original list", () => {
  assert.deepEqual(filterBookings(bookings, "", "f2").map(b => b._id), ["b2", "b3"]);
  assert.deepEqual(filterBookings(bookings, "สมชาย", "f2").map(b => b._id), ["b3"]);
  assert.equal(bookings.length, 3);
});

test("facility options are unique and null relations are handled", () => {
  const sparse = [...bookings, { _id: "b4", user: null, facility: null }];
  assert.equal(bookedFacilities(sparse).length, 2);
  assert.equal(filterBookings(sparse, "", "").length, 4);
  assert.equal(filterBookings(sparse, "somchai", "").length, 2);
  assert.deepEqual(bookedFacilities([]), []);
});
