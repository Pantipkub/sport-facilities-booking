const assert = require("node:assert/strict");
const { once } = require("node:events");
const { after, before, test } = require("node:test");
const jwt = require("jsonwebtoken");

// These HTTP tests replace database calls and never connect to the configured Atlas database.
process.env.MONGO_URI = "";
process.env.NODE_ENV = "production";
process.env.PORT = "0";
process.env.JWT_SECRET = "local-http-test-only";
process.env.JWT_EXPIRE = "1h";

const User = require("../models/User");
const Facility = require("../models/Facility");
const Booking = require("../models/Booking");
const { app, server } = require("../server");
const memberId = "507f1f77bcf86cd799439011";
const adminId = "507f1f77bcf86cd799439012";
const facilityId = "507f1f77bcf86cd799439013";
const bookingId = "507f1f77bcf86cd799439014";
const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
let baseUrl;

before(async () => {
  if (!server.listening) await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

async function request(path, { body, role, method = "POST" } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (role) {
    headers.Authorization = `Bearer ${jwt.sign({ id: role === "admin" ? adminId : memberId }, process.env.JWT_SECRET)}`;
  }
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { response, body: await response.json() };
}

function mockUser(t) {
  t.mock.method(User, "findById", async (id) => ({ id, role: id === adminId ? "admin" : "member" }));
}

test("health, Swagger and reverse-proxy configuration work", async () => {
  assert.equal(app.get("trust proxy"), 1);
  const { response, body } = await request("/health", { method: "GET" });
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(response.headers.get("x-ratelimit-limit"), "1000");
  const docs = await fetch(`${baseUrl}/api-docs/swagger-ui-init.js`);
  const text = await docs.text();
  assert.equal(docs.status, 200);
  assert.match(text, /"url": "\/"/);
  assert.match(text, /"multipleOf": 0.5/);
});

test("protected routes reject requests without a bearer token", async () => {
  for (const path of ["/api/v1/bookings", "/api/v1/auth/me"]) {
    const { response, body } = await request(path, { method: "GET" });
    assert.equal(response.status, 401);
    assert.equal(body.success, false);
    assert.equal(typeof body.error, "string");
  }
});

test("facility availability returns only booked times in order and excludes the edited booking", async (t) => {
  t.mock.method(Facility, "exists", async (filter) => {
    assert.deepEqual(filter, { _id: facilityId, isActive: true });
    return { _id: facilityId };
  });
  t.mock.method(Booking, "find", (filter) => {
    assert.deepEqual(filter, { facility: facilityId, bookingDate: new Date(date), _id: { $ne: bookingId } });
    return {
      select(fields) {
        assert.deepEqual(fields, { _id: 0, startMinutes: 1, endMinutes: 1 });
        return this;
      },
      sort(order) {
        assert.deepEqual(order, { startMinutes: 1 });
        return this;
      },
      lean: async () => [
        { startMinutes: 840, endMinutes: 900, user: memberId },
        { startMinutes: 1410, endMinutes: 1440 },
      ],
    };
  });
  const { response, body } = await request(
    `/api/v1/facilities/${facilityId}/availability?date=${date}&exclude=${bookingId}`,
    { method: "GET" },
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(body, {
    success: true, data: { date, booked: [
      { startTime: "14:00", endTime: "15:00" },
      { startTime: "23:30", endTime: "24:00" },
    ] },
  });
});

test("facility availability validates query parameters and rejects inactive or missing facilities", async (t) => {
  const exists = t.mock.method(Facility, "exists", async () => null);
  for (const query of ["", "?date=2026-02-30", "?date=2026-2-3", `?date=${date}&exclude=invalid`]) {
    const { response, body } = await request(`/api/v1/facilities/${facilityId}/availability${query}`, { method: "GET" });
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(typeof body.error, "string");
  }
  assert.equal(exists.mock.callCount(), 0);
  const { response } = await request(`/api/v1/facilities/${facilityId}/availability?date=${date}`, { method: "GET" });
  assert.equal(response.status, 404);
});

test("public registration always creates a member", async (t) => {
  const create = t.mock.method(User, "create", async (input) => ({
    ...input,
    _id: memberId,
    getSignedJwtToken: () => "test-token",
  }));
  const { response, body } = await request("/api/v1/auth/register", {
    body: { name: "Test", email: "test@example.com", tel: "0812345678", password: "test-password", role: "admin" },
  });
  assert.equal(response.status, 201);
  assert.equal(create.mock.calls[0].arguments[0].role, "member");
  assert.equal(body.data.role, "member");
});

test("duplicate fields return 400 with the frontend error contract", async (t) => {
  for (const [field, message] of [["email", "Email already registered"], ["name", "Facility name already exists"]]) {
    const create = t.mock.method(User, "create", async () => {
      throw Object.assign(new Error("duplicate"), { code: 11000, keyPattern: { [field]: 1 } });
    });
    const { response, body } = await request("/api/v1/auth/register", { body: {} });
    assert.equal(response.status, 400);
    assert.deepEqual(body, { success: false, error: message });
    create.mock.restore();
  }
});

test("Mongoose validation errors return 400 without a production stack", async (t) => {
  t.mock.method(User, "create", async (input) => {
    await new User(input).validate();
  });
  const { response, body } = await request("/api/v1/auth/register", { body: { email: "invalid" } });
  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.match(body.error, /Please add a valid email/);
  assert.match(body.error, /Please add a name/);
  assert.equal(body.stack, undefined);
});

test("malformed JSON returns 400 through the same error contract", async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(typeof body.error, "string");
  assert.equal(body.stack, undefined);
});

test("booking input rejects invalid times, durations and dates before database access", async (t) => {
  mockUser(t);
  const facility = t.mock.method(Facility, "findOne", async () => { throw new Error("Unexpected database access"); });
  const cases = [
    [{ startTime: "14:10" }, "Start time must be on the hour or half hour"],
    [{ startTime: "24:00" }, "bookingDate and startTime in HH:mm format are required"],
    [{ durationHours: 0.25 }, "Booking duration must be greater than 0 and at most 2 hours"],
    [{ durationHours: 0.75 }, "Booking duration must be in 30-minute increments"],
    [{ durationHours: 0 }, "Booking duration must be greater than 0 and at most 2 hours"],
    [{ durationHours: 2.5 }, "Booking duration must be greater than 0 and at most 2 hours"],
    [{ bookingDate: "2020-01-01" }, "Booking date cannot be in the past"],
    [{ bookingDate: "invalid" }, "Invalid booking date"],
    [{ startTime: "23:30", durationHours: 1 }, "Booking must end on the same day"],
  ];
  for (const [overrides, error] of cases) {
    const { response, body } = await request("/api/v1/bookings", {
      role: "member", body: { facility: facilityId, bookingDate: date, startTime: "14:00", durationHours: 1, ...overrides },
    });
    assert.equal(response.status, 400);
    assert.deepEqual(body, { success: false, error });
  }
  assert.equal(facility.mock.callCount(), 0);
});

test("half-hour intervals and bookings ending at midnight pass validation", async (t) => {
  mockUser(t);
  const facility = t.mock.method(Facility, "findOne", async () => null);
  for (const [startTime, durationHours] of [["06:00", 0.5], ["14:30", 1.5], ["22:00", 2], ["23:30", 0.5]]) {
    const { response, body } = await request("/api/v1/bookings", {
      role: "member", body: { facility: facilityId, bookingDate: date, startTime, durationHours },
    });
    assert.equal(response.status, 404);
    assert.equal(body.error, "Facility not found or inactive");
  }
  assert.equal(facility.mock.callCount(), 4);
});

test("admins cannot create bookings", async (t) => {
  mockUser(t);
  const { response, body } = await request("/api/v1/bookings", { role: "admin", body: {} });
  assert.equal(response.status, 403);
  assert.equal(body.success, false);
});

test("overlap checks use strict boundaries and return 409", async (t) => {
  mockUser(t);
  t.mock.method(Facility, "findOne", async () => ({ id: facilityId }));
  const conflict = t.mock.method(Booking, "findOne", async () => ({ _id: bookingId }));
  const { response, body } = await request("/api/v1/bookings", {
    role: "member", body: { facility: facilityId, bookingDate: date, startTime: "14:00", durationHours: 1.5 },
  });
  assert.equal(response.status, 409);
  assert.deepEqual(body, { success: false, error: "Facility or member already has an overlapping booking" });
  assert.deepEqual(conflict.mock.calls[0].arguments[0].$or, [
    { facility: facilityId, startMinutes: { $lt: 930 }, endMinutes: { $gt: 840 } },
    { user: memberId, startMinutes: { $lt: 930 }, endMinutes: { $gt: 840 } },
  ]);
});

test("admin edits check the original owner and exclude the booking itself", async (t) => {
  mockUser(t);
  t.mock.method(Booking, "findById", async () => ({
    id: bookingId, user: memberId, facility: facilityId,
    bookingDate: new Date(`${date}T00:00:00Z`), startTime: "14:00", durationHours: 1,
  }));
  t.mock.method(Facility, "findOne", async () => ({ id: facilityId }));
  const conflict = t.mock.method(Booking, "findOne", async () => ({ _id: "other-booking" }));
  const { response } = await request(`/api/v1/bookings/${bookingId}`, {
    method: "PUT", role: "admin", body: { startTime: "15:30" },
  });
  assert.equal(response.status, 409);
  const query = conflict.mock.calls[0].arguments[0];
  assert.equal(query.$or[1].user, memberId);
  assert.deepEqual(query._id, { $ne: bookingId });
});
