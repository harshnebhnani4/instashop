import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    instagram: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Lead = mongoose.model("Lead", leadSchema);
