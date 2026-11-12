import { Router } from "express";
import { Lead } from "../models/Lead.js";
import { sendLeadNotificationEmail } from "../lib/email.js";

export const leadsRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{10,13}$/;

function validateLead(body) {
  const { name, email, instagram, category, whatsapp } = body ?? {};
  if (typeof name !== "string" || name.trim().length < 2) return "Enter a valid name";
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) return "Enter a valid email";
  if (typeof instagram !== "string" || instagram.trim().length < 2) return "Enter a valid Instagram handle";
  if (typeof category !== "string" || category.trim().length < 2) return "Pick a category";
  if (typeof whatsapp !== "string" || !PHONE_RE.test(whatsapp.trim())) return "Enter a valid WhatsApp number";
  return null;
}

leadsRouter.post("/", async (req, res) => {
  const error = validateLead(req.body);
  if (error) return res.status(400).json({ error });

  const { name, email, instagram, category, whatsapp } = req.body;

  try {
    const lead = await Lead.create({
      name: name.trim(),
      email: email.trim(),
      instagram: instagram.trim().replace(/^@/, ""),
      category: category.trim(),
      whatsapp: whatsapp.trim(),
    });

    sendLeadNotificationEmail({
      name: lead.name,
      email: lead.email,
      instagram: lead.instagram,
      category: lead.category,
      whatsapp: lead.whatsapp,
    });

    return res.status(201).json({ id: lead._id });
  } catch (err) {
    console.error("Failed to save lead", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});
