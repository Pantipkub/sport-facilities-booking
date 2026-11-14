const assert = require("node:assert/strict");
const { test } = require("node:test");
const { getErrorMessage } = require("../src/libs/errors.ts");

test("booking errors explain the cause and next step in Thai", () => {
  const cases = [
    ["Booking date cannot be in the past", /ย้อนหลัง/],
    ["Invalid booking date", /วันที่จองไม่ถูกต้อง/],
    ["Start time must be on the hour or half hour", /30 นาที/],
    ["Booking duration must be greater than 0 and at most 2 hours", /30 นาทีถึง 2 ชั่วโมง/],
    ["Booking duration must be in 30-minute increments", /ช่วงละ 30 นาที/],
    ["Booking must end on the same day", /24:00/],
    ["Facility or member already has an overlapping booking", /เวลาซ้อนกัน/],
    ["Facility not found or inactive", /เลือกสนามอื่น/],
  ];
  for (const [error, expected] of cases) assert.match(getErrorMessage(error, 400), expected);
});

test("known auth and permission errors take precedence over generic HTTP status", () => {
  assert.equal(getErrorMessage("Invalid credentials", 401), "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  assert.match(getErrorMessage("Not authorized to edit this booking", 403), /แก้ไข/);
  assert.match(getErrorMessage("Booking not found", 404), /รายการจอง/);
  assert.match(getErrorMessage("Cannot reach the server", 0), /เชื่อมต่อ/);
});

test("duplicate keys and joined model validation messages are translated without exposing values", () => {
  assert.match(getErrorMessage("E11000 duplicate key collection: users index: email_1 dup key: { email: private@example.com }", 500), /อีเมลนี้ถูกใช้/);
  assert.match(getErrorMessage("E11000 duplicate key collection: facilities index: name_1", 500), /ชื่อสนาม/);
  const validation = getErrorMessage("Facility validation failed: name: Please add a facility name, capacity: Capacity must be at least 1", 400);
  assert.match(validation, /กรุณากรอกชื่อสนาม/);
  assert.match(validation, /อย่างน้อย 1 คน/);
  assert.doesNotMatch(validation, /Facility|validation|capacity/);
});

test("unknown responses return a safe Thai fallback", () => {
  const internal = "MongoServerError: mongodb://private-host/database";
  assert.equal(getErrorMessage(internal, 500), "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
  assert.equal(getErrorMessage(internal, 500, "จองสนามไม่สำเร็จ"), "จองสนามไม่สำเร็จ");
  assert.match(getErrorMessage(internal, 401), /เข้าสู่ระบบใหม่/);
  assert.match(getErrorMessage(internal, 429), /รอสักครู่/);
  assert.equal(getErrorMessage("constructor", 500), "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
  assert.equal(getErrorMessage("__proto__", 500), "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
});
