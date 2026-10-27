// Usage: node src/scripts/addPromoCode.js <CODE> <AMOUNT_IN_INR>
// Example: node src/scripts/addPromoCode.js UZMAMALQ 999
import "dotenv/config";
import { connectDB } from "../db.js";
import { PromoCode } from "../models/PromoCode.js";
import mongoose from "mongoose";

const [, , code, amountStr] = process.argv;

if (!code || !amountStr || Number.isNaN(Number(amountStr))) {
  console.error("Usage: node src/scripts/addPromoCode.js <CODE> <AMOUNT_IN_INR>");
  process.exit(1);
}

await connectDB();

const promo = await PromoCode.findOneAndUpdate(
  { code: code.trim().toUpperCase() },
  { amount: Number(amountStr), active: true },
  { upsert: true, new: true },
);

console.log(`Saved promo code: ${promo.code} -> ₹${promo.amount}`);
await mongoose.disconnect();
