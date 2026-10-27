import mongoose from "mongoose";

const CATEGORIES = ["Clothes", "Shoes", "Crochet", "Jewellery", "Beauty", "Home Decor", "Accessories", "Handmade", "Other"];

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    instagram: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    promoCode: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
  },
  { timestamps: true },
);

export const CATEGORY_VALUES = CATEGORIES;
export const Seller = mongoose.model("Seller", sellerSchema);
