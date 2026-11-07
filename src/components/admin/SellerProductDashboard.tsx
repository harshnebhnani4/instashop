import { useState, type ChangeEvent } from "react";
import { ImagePlus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminSession } from "@/lib/adminAuth";

export function SellerProductDashboard({ session }: { session: AdminSession }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Your Products</h1>
        <p className="text-sm text-muted-foreground">
          {session.name ? `Welcome back, ${session.name}.` : "Manage the products in your Instashop listing."}
        </p>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle>Instant AI</CardTitle>
            <Badge variant="secondary">Soon</Badge>
          </div>
          <CardDescription>
            Paste a link to your Instagram post and we'll automatically fill in the product details below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input placeholder="https://instagram.com/p/..." className="flex-1" disabled />
          <Button disabled className="sm:w-auto">
            Fetch with AI — Soon
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a Product</CardTitle>
          <CardDescription>Fill in your product details. Saving products is launching soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="product-name">Product name</Label>
              <Input id="product-name" placeholder="e.g. Handwoven Cotton Kurta" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-image">Product image</Label>
              <label
                htmlFor="product-image"
                className="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/30 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Product preview" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <>
                    <ImagePlus className="size-6" />
                    <span>Click to upload an image</span>
                  </>
                )}
              </label>
              <input id="product-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-price">Price (₹)</Label>
                <Input id="product-price" type="number" min="0" placeholder="999" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-delivery">Delivery charge (₹)</Label>
                <Input id="product-delivery" type="number" min="0" placeholder="0 for free delivery" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea id="product-description" placeholder="Fabric, sizing, care instructions, etc." rows={3} />
            </div>

            <Button type="submit" className="w-full" disabled>
              Soon
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
