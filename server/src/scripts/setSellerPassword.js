// Usage: node src/scripts/setSellerPassword.js <SELLER_EMAIL> <NEW_PASSWORD>
// Sets (or resets) the login password for an existing seller — e.g. for
// accounts created before login existed, or a manual password reset.
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import { Seller } from "../models/Seller.js";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Usage: node src/scripts/setSellerPassword.js <SELLER_EMAIL> <NEW_PASSWORD>");
  process.exit(1);
}
if (password.length < 6) {
  console.error("Password must be at least 6 characters");
  process.exit(1);
}

await connectDB();

const passwordHash = await bcrypt.hash(password, 10);
const seller = await Seller.findOneAndUpdate(
  { email: email.trim().toLowerCase() },
  { passwordHash },
  { new: true, sort: { createdAt: -1 } },
);

if (!seller) {
  console.error(`No seller found with email "${email}".`);
  process.exit(1);
}

console.log(`Password set for ${seller.name} <${seller.email}>`);
await mongoose.disconnect();
