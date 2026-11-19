import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0, default: 0 },
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

productSchema.index({ shopId: 1, createdAt: -1 });

export const Product = mongoose.model("Product", productSchema);
