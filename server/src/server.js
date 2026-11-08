import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import { paymentsRouter } from "./routes/payments.js";
import { adminRouter } from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:8080")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
// Keep the raw request bytes around for the Razorpay webhook, which must
// verify its signature against the exact bytes Razorpay sent, not a
// re-serialized copy of the parsed JSON.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
// Razorpay's redirect-based checkout callback posts form-encoded data.
app.use(express.urlencoded({ extended: false }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Instashop API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
