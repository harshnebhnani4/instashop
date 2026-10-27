import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    amount: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const PromoCode = mongoose.model("PromoCode", promoCodeSchema);
