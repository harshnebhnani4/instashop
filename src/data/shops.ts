import beauty from "@/assets/beauty.jpg";
import fashion from "@/assets/fashion.jpg";
import jewellery from "@/assets/jewellery.jpg";
import footwear from "@/assets/footwear.jpg";

export const images = { beauty, fashion, jewellery, footwear };

export type Category = "Fashion" | "Beauty" | "Jewellery" | "Home Decor" | "Footwear" | "Gifting" | "Accessories" | "Handmade";

export interface Product { id: string; name: string; price: number; image: string; alt: string }
export interface Shop {
  name: string;
  handle: string;
  avatar: string;
  category: Category;
  followers: number;
  instagramUrl: string;
  products: Product[];
  isNew?: boolean | undefined;
  trending?: number;
}

const pool = [fashion, beauty, jewellery, footwear];
const pick = (i: number): string => pool[i % pool.length]!;

const raw: [string, string, Category, number, number, boolean?][] = [
  ["Gulabo Studio", "gulabo.studio", "Fashion", 128000, 98],
  ["Kesar Glow", "kesarglow", "Beauty", 94000, 91],
  ["Moti & Co", "motiandco", "Jewellery", 61000, 87, true],
  ["Chappal Club", "chappal.club", "Footwear", 45000, 80],
  ["Mitti Ghar", "mittighar.decor", "Home Decor", 33000, 72, true],
  ["Tohfa Box", "tohfabox", "Gifting", 27000, 76],
  ["Jhumka Junction", "jhumkajunction", "Accessories", 152000, 95],
  ["Haath Se", "haathse.handmade", "Handmade", 18000, 70, true],
  ["Rangrez Label", "rangrez.label", "Fashion", 73000, 84],
  ["Blush Bar India", "blushbar.in", "Beauty", 210000, 99],
  ["Sona Saath", "sonasaath", "Jewellery", 39000, 68, true],
  ["Sneak Bazaar", "sneakbazaar", "Footwear", 86000, 89],
];

export const shops: Shop[] = raw.map(([name, handle, category, followers, trending, isNew], i) => ({
  name,
  handle,
  avatar: pick(i),
  category,
  followers,
  trending,
  isNew,
  instagramUrl: `https://instagram.com/${handle}`,
  products: [0, 1, 2].map((k) => ({
    id: `${handle}-${k}`,
    name: `${name} piece ${k + 1}`,
    price: 499 + ((i * 7 + k * 13) % 20) * 100,
    image: pick(i + k + 1),
    alt: `${category} product from ${name}`,
  })),
}));

export const categories: { name: Category; count: number; image: string }[] = [
  { name: "Fashion", count: 820, image: fashion },
  { name: "Beauty", count: 640, image: beauty },
  { name: "Jewellery", count: 410, image: jewellery },
  { name: "Footwear", count: 230, image: footwear },
  { name: "Home Decor", count: 190, image: fashion },
  { name: "Gifting", count: 160, image: jewellery },
  { name: "Accessories", count: 350, image: beauty },
];

export const formatK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}K` : `${n}`);
