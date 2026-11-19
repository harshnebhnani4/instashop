import { Router } from "express";
import { CATEGORY_VALUES } from "../models/Seller.js";
import { Shop } from "../models/Shop.js";
import { Product } from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";

export const sellerRouter = Router();

sellerRouter.use(requireAuth(["seller"]));

function validateShop(body) {
  const { name, instagram, category } = body ?? {};
  if (typeof name !== "string" || name.trim().length < 2) return "Enter a shop name";
  if (typeof instagram !== "string" || instagram.trim().length < 2) return "Enter a valid Instagram handle";
  if (typeof category !== "string" || !CATEGORY_VALUES.includes(category)) return "Pick a valid category";
  return null;
}

function validateProduct(body) {
  const { name, imageUrl, price, deliveryCharge } = body ?? {};
  if (typeof name !== "string" || name.trim().length < 2) return "Enter a product name";
  if (typeof imageUrl !== "string" || !imageUrl.trim()) return "Add a product image";
  if (typeof price !== "number" || Number.isNaN(price) || price < 0) return "Enter a valid price";
  if (deliveryCharge !== undefined && (typeof deliveryCharge !== "number" || Number.isNaN(deliveryCharge) || deliveryCharge < 0)) {
    return "Enter a valid delivery charge";
  }
  return null;
}

// The seller's own shop, or null if they haven't set one up yet.
sellerRouter.get("/shop", async (req, res) => {
  const shop = await Shop.findOne({ sellerId: req.admin.sellerId });
  res.json({ shop });
});

// Create or update the seller's own shop (one per seller).
sellerRouter.put("/shop", async (req, res) => {
  const error = validateShop(req.body);
  if (error) return res.status(400).json({ error });

  const { name, instagram, category, description } = req.body;
  const handle = instagram.trim().replace(/^@/, "").toLowerCase();

  try {
    const existingWithHandle = await Shop.findOne({ instagram: handle, sellerId: { $ne: req.admin.sellerId } });
    if (existingWithHandle) return res.status(409).json({ error: "This Instagram handle is already taken" });

    const shop = await Shop.findOneAndUpdate(
      { sellerId: req.admin.sellerId },
      {
        sellerId: req.admin.sellerId,
        name: name.trim(),
        instagram: handle,
        category,
        description: typeof description === "string" ? description.trim() : "",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    res.json({ shop });
  } catch (err) {
    console.error("Failed to save shop", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Products belonging to the seller's own shop.
sellerRouter.get("/products", async (req, res) => {
  const shop = await Shop.findOne({ sellerId: req.admin.sellerId });
  if (!shop) return res.json({ products: [] });

  const products = await Product.find({ shopId: shop._id }).sort({ createdAt: -1 });
  res.json({ products });
});

sellerRouter.post("/products", async (req, res) => {
  const shop = await Shop.findOne({ sellerId: req.admin.sellerId });
  if (!shop) return res.status(400).json({ error: "Set up your shop before adding products" });

  const error = validateProduct(req.body);
  if (error) return res.status(400).json({ error });

  const { name, imageUrl, price, deliveryCharge, description } = req.body;

  try {
    const product = await Product.create({
      shopId: shop._id,
      name: name.trim(),
      imageUrl: imageUrl.trim(),
      price,
      deliveryCharge: deliveryCharge ?? 0,
      description: typeof description === "string" ? description.trim() : "",
    });
    res.status(201).json({ product });
  } catch (err) {
    console.error("Failed to add product", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

sellerRouter.delete("/products/:id", async (req, res) => {
  const shop = await Shop.findOne({ sellerId: req.admin.sellerId });
  if (!shop) return res.status(404).json({ error: "Product not found" });

  const deleted = await Product.findOneAndDelete({ _id: req.params.id, shopId: shop._id });
  if (!deleted) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true });
});
