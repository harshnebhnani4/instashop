import mongoose from "mongoose";

// Holds a seller's signup details between order creation and payment
// confirmation, so a payment can be finalized into a Seller record by
// *either* the frontend's post-payment call or the Razorpay webhook —
// whichever reaches us first (mobile UPI flows often drop the frontend
// callback after the user switches to their UPI app and back).
const pendingSignupSchema = new mongoose.Schema(
  {
    razorpayOrderId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    instagram: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    passwordHash: { type: String, required: true },
    promoCode: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true },
  },
  { timestamps: true },
);

// Auto-expire abandoned checkouts (payment never completed) after 24h.
pendingSignupSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export const PendingSignup = mongoose.model("PendingSignup", pendingSignupSchema);
