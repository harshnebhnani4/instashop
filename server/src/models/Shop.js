import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    // Doubles as the public URL slug (/shop/:handle) — lowercase, no leading @.
    instagram: { type: String, required: true, trim: true, lowercase: true, unique: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    logoUrl: { type: String, trim: true, default: "" },
    bannerUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

export const Shop = mongoose.model("Shop", shopSchema);
