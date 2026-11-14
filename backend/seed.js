const path = require("node:path");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Facility = require("./models/Facility");

dotenv.config({ path: path.join(__dirname, "config/config.env") });

const facilities = [
  { name: "สนามแบดมินตัน A", sportType: "badminton", location: "สาขาสามย่าน ชั้น 2", capacity: 4, hourlyRate: 180 },
  { name: "สนามเทนนิส 1", sportType: "tennis", location: "สาขาบรรทัดทอง ลานกลางแจ้ง", capacity: 4, hourlyRate: 300 },
  { name: "สนามฟุตซอล", sportType: "futsal", location: "สาขาบรรทัดทอง ชั้น 1", capacity: 14, hourlyRate: 900 },
  { name: "สนามบาสเกตบอล", sportType: "basketball", location: "สาขาสามย่าน ชั้น 1", capacity: 10, hourlyRate: 400 },
  { name: "สนามวอลเลย์บอล", sportType: "volleyball", location: "สาขาสยาม ชั้น 4", capacity: 12, hourlyRate: 500 },
  { name: "ห้องปิงปอง", sportType: "table-tennis", location: "สาขาสามย่าน ชั้น 3", capacity: 4, hourlyRate: 120 },
  { name: "ห้องฟิตเนส", sportType: "gym", location: "สาขาสยาม ชั้น 4", capacity: 20, hourlyRate: 150 },
];

async function seedData({
  adminPassword = process.env.SEED_ADMIN_PASSWORD,
  memberPassword = process.env.SEED_MEMBER_PASSWORD,
} = {}) {
  for (const [key, value] of [["SEED_ADMIN_PASSWORD", adminPassword], ["SEED_MEMBER_PASSWORD", memberPassword]]) {
    if (typeof value !== "string" || value.length < 6) {
      throw new Error(`Set ${key} to at least 6 characters in config/config.env or the environment before running seed.`);
    }
  }

  const accounts = [
    {
      name: "ผู้ดูแลระบบ",
      email: "admin@courtbook.test",
      tel: "0812345678",
      password: adminPassword,
      role: "admin",
    },
    {
      name: "สมชาย ใจดี",
      email: "member@courtbook.test",
      tel: "0898765432",
      password: memberPassword,
      role: "member",
    },
  ];

  // Ensure the unique email/name indexes exist before concurrent upserts can run.
  await Promise.all([User.init(), Facility.init()]);

  for (const account of accounts) {
    await new User(account).validate();
    // Query updates do not execute User's pre-save password hook.
    const password = await bcrypt.hash(account.password, 10);
    await User.findOneAndUpdate(
      { email: account.email },
      { $setOnInsert: { ...account, password } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
  }

  for (const facility of facilities) {
    await Facility.findOneAndUpdate(
      { name: facility.name },
      { $setOnInsert: { ...facility, isActive: true } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
  }
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("Set MONGO_URI in config/config.env or the environment before running seed.");
  }
  try {
    await connectDB();
    await seedData();
    console.log("Seed complete: 2 demo accounts and 7 facilities are available. Existing records were preserved.");
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { seedData };
