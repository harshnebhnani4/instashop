import { Router } from "express";
import bcrypt from "bcryptjs";
import { PromoCode } from "../models/PromoCode.js";
import { Seller } from "../models/Seller.js";
import { requireAuth, signAdminToken } from "../middleware/auth.js";

export const adminRouter = Router();

const RANGES = ["daily", "monthly", "yearly"];
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Day/month/year boundaries must be computed in IST (the business's timezone),
// not the server's local/UTC time — otherwise "today" cuts off a few hours
// early for everyone in India, while a server running on UTC still shows the
// extra records once the window widens to "this month".
function rangeStart(range) {
  const istNow = new Date(Date.now() + IST_OFFSET_MS);
  let istBoundary;
  if (range === "monthly") {
    istBoundary = Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), 1);
  } else if (range === "yearly") {
    istBoundary = Date.UTC(istNow.getUTCFullYear(), 0, 1);
  } else {
    istBoundary = Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate());
  }
  return new Date(istBoundary - IST_OFFSET_MS);
}

function parseRange(value) {
  return RANGES.includes(value) ? value : "daily";
}

adminRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return res.status(400).json({ error: "Enter your email and password" });
  }
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === (process.env.ADMIN_EMAIL || "").toLowerCase() && password === process.env.ADMIN_PASSWORD) {
    const token = signAdminToken({ role: "superadmin", email: normalizedEmail });
    return res.json({ token, role: "superadmin" });
  }

  const seller = await Seller.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
  if (!seller || !seller.passwordHash) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const match = await bcrypt.compare(password, seller.passwordHash);
  if (!match) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signAdminToken({ role: "seller", email: normalizedEmail, sellerId: seller._id.toString(), name: seller.name });
  return res.json({ token, role: "seller", name: seller.name });
});

adminRouter.get("/me", requireAuth(), (req, res) => {
  res.json(req.admin);
});

// Superadmin: usage counts for every promo code in the given range.
adminRouter.get("/promo-codes", requireAuth(["superadmin"]), async (req, res) => {
  const range = parseRange(req.query.range);
  const since = rangeStart(range);

  const promoCodes = await PromoCode.find().sort({ code: 1 }).lean();
  const counts = await Seller.aggregate([
    { $match: { promoCode: { $ne: "" }, createdAt: { $gte: since } } },
    { $group: { _id: "$promoCode", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
  ]);
  const countsByCode = new Map(counts.map((c) => [c._id, c]));

  const data = promoCodes.map((p) => ({
    code: p.code,
    ownerName: p.ownerName || "",
    amount: p.amount,
    active: p.active,
    count: countsByCode.get(p.code)?.count ?? 0,
    totalAmount: countsByCode.get(p.code)?.totalAmount ?? 0,
  }));

  res.json({ range, promoCodes: data });
});

// Sellers who used a given promo code in the range. Superadmin only.
adminRouter.get("/promo-codes/:code/sellers", requireAuth(["superadmin"]), async (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const range = parseRange(req.query.range);
  const since = rangeStart(range);

  const sellers = await Seller.find({ promoCode: code, createdAt: { $gte: since } })
    .sort({ createdAt: -1 })
    .select("name email phone instagram category amount createdAt")
    .lean();

  res.json({
    range,
    code,
    count: sellers.length,
    totalAmount: sellers.reduce((sum, s) => sum + (s.amount || 0), 0),
    sellers,
  });
});

// Add a new promo code. Superadmin only.
adminRouter.post("/promo-codes", requireAuth(["superadmin"]), async (req, res) => {
  const { code, amount, ownerName } = req.body ?? {};
  const trimmedCode = typeof code === "string" ? code.trim().toUpperCase() : "";
  const numericAmount = Number(amount);

  if (!trimmedCode) return res.status(400).json({ error: "Enter a promo code" });
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "Enter a valid amount" });
  }

  const exists = await PromoCode.findOne({ code: trimmedCode });
  if (exists) return res.status(409).json({ error: "This promo code already exists" });

  const promo = await PromoCode.create({
    code: trimmedCode,
    amount: numericAmount,
    ownerName: typeof ownerName === "string" ? ownerName.trim() : "",
  });

  res.status(201).json({ code: promo.code, amount: promo.amount, ownerName: promo.ownerName, active: promo.active });
});

// Delete a promo code. Superadmin only.
adminRouter.delete("/promo-codes/:code", requireAuth(["superadmin"]), async (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const deleted = await PromoCode.findOneAndDelete({ code });
  if (!deleted) return res.status(404).json({ error: "Promo code not found" });
  res.json({ ok: true });
});

// Total sellers (all-time) plus sellers who signed up in the given range. Superadmin only.
adminRouter.get("/sellers", requireAuth(["superadmin"]), async (req, res) => {
  const range = parseRange(req.query.range);
  const since = rangeStart(range);

  const [totalSellers, sellers] = await Promise.all([
    Seller.countDocuments(),
    Seller.find({ createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .select("name email phone instagram category promoCode amount createdAt")
      .limit(200)
      .lean(),
  ]);

  res.json({
    range,
    totalSellers,
    count: sellers.length,
    totalAmount: sellers.reduce((sum, s) => sum + (s.amount || 0), 0),
    sellers,
  });
});
