import { Router } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import Razorpay from "razorpay";
import { CATEGORY_VALUES, Seller } from "../models/Seller.js";
import { PromoCode } from "../models/PromoCode.js";
import { PendingSignup } from "../models/PendingSignup.js";
import { sendSellerWelcomeEmail } from "../lib/email.js";

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

function validatePassword(body) {
  const { password } = body ?? {};
  if (typeof password !== "string" || password.length < 6) {
    return "Password must be at least 6 characters";
  }
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

// Turns a confirmed payment into a Seller record. Called from both the
// frontend's post-payment request and the Razorpay webhook — whichever
// arrives first wins, the other is a no-op. Safe to call more than once
// for the same order.
async function finalizeSeller(razorpayOrderId, razorpayPaymentId) {
  const existing = await Seller.findOne({ razorpayOrderId });
  if (existing) return existing;

  const pending = await PendingSignup.findOne({ razorpayOrderId });
  if (!pending) return null;

  let seller;
  try {
    seller = await Seller.create({
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      instagram: pending.instagram,
      category: pending.category,
      passwordHash: pending.passwordHash,
      promoCode: pending.promoCode,
      amount: pending.amount,
      razorpayOrderId,
      razorpayPaymentId,
    });
  } catch (err) {
    // Unique index on razorpayOrderId: the other path (webhook vs. frontend)
    // won the race between our existence check and this insert.
    if (err.code === 11000) return Seller.findOne({ razorpayOrderId });
    throw err;
  }

  await PendingSignup.deleteOne({ razorpayOrderId });
  sendSellerWelcomeEmail({ name: seller.name, email: seller.email, instagram: seller.instagram });
  return seller;
}

paymentsRouter.get("/promo-code", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : "";
  if (!code.trim()) return res.status(400).json({ error: "Enter a promo code" });

  const { amount, error } = await resolveAmount(code);
  if (error) return res.status(404).json({ error });
  return res.json({ amount, defaultAmount: DEFAULT_AMOUNT_INR });
});

paymentsRouter.post("/create-order", async (req, res) => {
  const { name, email, phone, instagram, category, password, promoCode } = req.body ?? {};

  const error = validateSeller(req.body) || validatePassword(req.body);
  if (error) return res.status(400).json({ error });

  const { amount, error: promoError } = await resolveAmount(promoCode);
  if (promoError) return res.status(400).json({ error: promoError });

  try {
    const order = await getRazorpay().orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `seller_${Date.now()}`,
    });

    const passwordHash = await bcrypt.hash(password, 10);
    await PendingSignup.create({
      razorpayOrderId: order.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      instagram: instagram.trim().replace(/^@/, ""),
      category,
      passwordHash,
      promoCode: typeof promoCode === "string" ? promoCode.trim() : "",
      amount,
    });

    return res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("Failed to create Razorpay order", err);
    return res.status(500).json({ error: "Could not start payment. Please try again." });
  }
});

// Fired by the browser right after Razorpay's checkout succeeds. On mobile,
// especially after a UPI app round-trip, this request can simply never
// happen — the webhook below is the reliable fallback for that case.
paymentsRouter.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body ?? {};

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

  try {
    const seller = await finalizeSeller(razorpay_order_id, razorpay_payment_id);
    if (!seller) {
      return res.status(404).json({ error: "We couldn't find this order. Contact support if you were charged." });
    }
    return res.status(201).json({ id: seller._id });
  } catch (err) {
    console.error("Failed to save seller after payment", err);
    return res.status(500).json({ error: "Payment succeeded but saving your details failed. Contact support." });
  }
});

// Razorpay calls this directly from their servers once a payment is
// captured — independent of whatever happens in the buyer's browser. This
// is what makes signup reliable on mobile when the /verify call above gets
// dropped during a UPI app switch.
paymentsRouter.post("/webhook", async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret || !signature || !req.rawBody) {
    return res.status(400).json({ error: "Webhook not configured" });
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
  if (expectedSignature !== signature) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  // Always 200 once the signature checks out, so Razorpay doesn't keep
  // retrying events we deliberately ignore (anything but a captured payment).
  const payment = req.body?.payload?.payment?.entity;
  if (req.body?.event !== "payment.captured" || !payment?.order_id || !payment?.id) {
    return res.json({ ok: true, ignored: true });
  }

  try {
    await finalizeSeller(payment.order_id, payment.id);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Failed to finalize seller from webhook", err);
    return res.status(500).json({ error: "Internal error" });
  }
});
