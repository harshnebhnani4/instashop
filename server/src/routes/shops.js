import { Router } from "express";
import { Shop } from "../models/Shop.js";
import { Product } from "../models/Product.js";

export const shopsRouter = Router();

// Public: a shop's storefront — its details plus every product it sells.
shopsRouter.get("/:handle", async (req, res) => {
  const handle = req.params.handle.trim().replace(/^@/, "").toLowerCase();
  const shop = await Shop.findOne({ instagram: handle });
  if (!shop) return res.status(404).json({ error: "Shop not found" });

  const products = await Product.find({ shopId: shop._id }).sort({ createdAt: -1 });
  res.json({ shop, products });
});

// Public: a single product plus the shop it belongs to, for attribution.
shopsRouter.get("/:handle/products/:productId", async (req, res) => {
  const handle = req.params.handle.trim().replace(/^@/, "").toLowerCase();
  const shop = await Shop.findOne({ instagram: handle });
  if (!shop) return res.status(404).json({ error: "Shop not found" });

  const product = await Product.findOne({ _id: req.params.productId, shopId: shop._id });
  if (!product) return res.status(404).json({ error: "Product not found" });

  res.json({ product, shop });
});
