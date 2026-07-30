/**
 * One-time script to create the first admin account.
 * Run with: npm run seed:admin
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

(async () => {
  await connectDB();

  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const email = process.env.SEED_ADMIN_EMAIL || "admin@cybersafeindia.example";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeThisPassword123!";

  const existing = await Admin.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    console.log("An admin with this username/email already exists. Skipping.");
    await mongoose.disconnect();
    process.exit(0);
  }

  await Admin.create({ username, email, password, role: "superadmin" });
  console.log(`Admin created: ${username} (${email}). Please log in and change the password.`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
