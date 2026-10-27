import { Router } from "express";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { CATEGORY_VALUES, Seller } from "../models/Seller.js";
import { PromoCode } from "../models/PromoCode.js";

export const paymentsRouter = Router();

const DEFAULT_AMOUNT_INR = 1499;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{10,13}$/;

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

function validateSeller(body) {
  const { name, email, phone, instagram, category } = body ?? {};
  if (typeof name !== "string" || name.trim().length < 2) return "Enter a valid name";
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) return "Enter a valid email";
  if (typeof phone !== "string" || !PHONE_RE.test(phone.trim())) return "Enter a valid phone number";
  if (typeof instagram !== "string" || instagram.trim().length < 2) return "Enter a valid Instagram handle";
  if (typeof category !== "string" || !CATEGORY_VALUES.includes(category)) return "Pick a valid category";
  return null;
}

// Resolves the price to charge. No promo code -> default price.
// Promo code given -> must match an active row in the promocodes collection, or it's rejected.
async function resolveAmount(promoCode) {
  const trimmed = typeof promoCode === "string" ? promoCode.trim() : "";
  if (!trimmed) return { amount: DEFAULT_AMOUNT_INR, error: null };

  const promo = await PromoCode.findOne({ code: trimmed.toUpperCase(), active: true });
  if (!promo) return { amount: null, error: "Invalid promo code" };
  return { amount: promo.amount, error: null };
}

paymentsRouter.get("/promo-code", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : "";
  if (!code.trim()) return res.status(400).json({ error: "Enter a promo code" });

  const { amount, error } = await resolveAmount(code);
  if (error) return res.status(404).json({ error });
  return res.json({ amount, defaultAmount: DEFAULT_AMOUNT_INR });
});

paymentsRouter.post("/create-order", async (req, res) => {
  const error = validateSeller(req.body);
  if (error) return res.status(400).json({ error });

  const { amount, error: promoError } = await resolveAmount(req.body?.promoCode);
  if (promoError) return res.status(400).json({ error: promoError });

  try {
    const order = await getRazorpay().orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `seller_${Date.now()}`,
    });
    return res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("Failed to create Razorpay order", err);
    return res.status(500).json({ error: "Could not start payment. Please try again." });
  }
});

paymentsRouter.post("/verify", async (req, res) => {
  const { name, email, phone, instagram, category, promoCode, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body ?? {};

  const error = validateSeller(req.body);
  if (error) return res.status(400).json({ error });
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment details" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: "Payment verification failed" });
  }

  const { amount, error: promoError } = await resolveAmount(promoCode);
  if (promoError) return res.status(400).json({ error: promoError });

  try {
    const seller = await Seller.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      instagram: instagram.trim().replace(/^@/, ""),
      category,
      promoCode: typeof promoCode === "string" ? promoCode.trim() : "",
      amount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });
    return res.status(201).json({ id: seller._id });
  } catch (err) {
    console.error("Failed to save seller after payment", err);
    return res.status(500).json({ error: "Payment succeeded but saving your details failed. Contact support." });
  }
});
