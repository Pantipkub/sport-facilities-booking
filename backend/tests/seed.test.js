const assert = require("node:assert/strict");
const { test } = require("node:test");
const { randomBytes } = require("node:crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Facility = require("../models/Facility");
const { seedData } = require("../seed");

test("seed refuses missing passwords before accessing the database", async (t) => {
  const init = t.mock.method(User, "init", async () => {});
  await assert.rejects(seedData({ adminPassword: "", memberPassword: "" }), /SEED_ADMIN_PASSWORD/);
  await assert.rejects(seedData({ adminPassword: randomBytes(24).toString("base64url"), memberPassword: "" }), /SEED_MEMBER_PASSWORD/);
  assert.equal(init.mock.callCount(), 0);
});

test("seed uses validated upserts, hashes passwords and preserves existing records", async (t) => {
  const credentials = {
    adminPassword: randomBytes(24).toString("base64url"),
    memberPassword: randomBytes(24).toString("base64url"),
  };
  const users = new Map();
  const facilities = new Map();
  t.mock.method(User, "init", async () => {});
  t.mock.method(Facility, "init", async () => {});
  const makeUpsert = (records, key) => async (filter, update, options) => {
    assert.deepEqual(Object.keys(update), ["$setOnInsert"]);
    assert.equal(options.upsert, true);
    assert.equal(options.runValidators, true);
    assert.equal(options.setDefaultsOnInsert, true);
    if (!records.has(filter[key])) records.set(filter[key], { ...update.$setOnInsert });
    return records.get(filter[key]);
  };
  t.mock.method(User, "findOneAndUpdate", makeUpsert(users, "email"));
  t.mock.method(Facility, "findOneAndUpdate", makeUpsert(facilities, "name"));

  await seedData(credentials);
  assert.equal(users.size, 2);
  assert.equal(facilities.size, 7);
  assert.deepEqual([...users.values()].map((user) => user.role), ["admin", "member"]);
  assert.deepEqual([...facilities.values()].map((facility) => facility.sportType).sort(),
    ["badminton", "basketball", "futsal", "gym", "table-tennis", "tennis", "volleyball"]);
  for (const [email, plain] of [["admin@courtbook.test", credentials.adminPassword], ["member@courtbook.test", credentials.memberPassword]]) {
    const account = users.get(email);
    assert.notEqual(account.password, plain);
    assert.equal(await bcrypt.compare(plain, account.password), true);
  }

  const originalPassword = users.get("admin@courtbook.test").password;
  const firstFacility = facilities.values().next().value;
  firstFacility.hourlyRate = 999;
  await seedData(credentials);
  assert.equal(users.size, 2);
  assert.equal(facilities.size, 7);
  assert.equal(users.get("admin@courtbook.test").password, originalPassword);
  assert.equal(firstFacility.hourlyRate, 999);
});
