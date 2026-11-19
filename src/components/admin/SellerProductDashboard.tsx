import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Loader2, Sparkles, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { adminDeleteJSON, adminGetJSON, adminPostJSON, adminPutJSON, type AdminSession } from "@/lib/adminAuth";
import { uploadImage } from "@/lib/cloudinary";

const CATEGORIES = ["Clothes", "Shoes", "Crochet", "Jewellery", "Beauty", "Home Decor", "Accessories", "Handmade", "Other"];

type Shop = {
  _id: string;
  name: string;
  instagram: string;
  category: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
};

type Product = {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
  deliveryCharge: number;
  description: string;
};

export function SellerProductDashboard({ session }: { session: AdminSession }) {
  const { data, isLoading } = useQuery({
    queryKey: ["seller-shop"],
    queryFn: () => adminGetJSON<{ shop: Shop | null }>("/api/seller/shop"),
  });

  const hasShop = Boolean(data?.shop);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Your Shop</h1>
        <p className="text-sm text-muted-foreground">
          {session.name ? `Welcome back, ${session.name}.` : "Set up your shop and manage your products."}
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <Tabs defaultValue={hasShop ? "products" : "shop"}>
          <TabsList>
            <TabsTrigger value="shop">Shop setup</TabsTrigger>
            <TabsTrigger value="products" disabled={!hasShop}>
              Products
            </TabsTrigger>
          </TabsList>
          <TabsContent value="shop">
            <ShopSetupForm shop={data?.shop ?? null} />
          </TabsContent>
          <TabsContent value="products">{hasShop && data?.shop && <ProductsPanel shop={data.shop} />}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function ShopSetupForm({ shop }: { shop: Shop | null }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(shop?.name ?? "");
  const [instagram, setInstagram] = useState(shop?.instagram ?? "");
  const [category, setCategory] = useState(shop?.category ?? "");
  const [description, setDescription] = useState(shop?.description ?? "");

  const saveMutation = useMutation({
    mutationFn: () => adminPutJSON<{ shop: Shop }>("/api/seller/shop", { name, instagram, category, description }),
    onSuccess: () => {
      toast.success(shop ? "Shop updated" : "Shop created — you can add products now");
      queryClient.invalidateQueries({ queryKey: ["seller-shop"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save your shop"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !instagram.trim() || !category) {
      toast.error("Fill in your shop name, Instagram handle and category");
      return;
    }
    saveMutation.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{shop ? "Edit your shop" : "Set up your shop"}</CardTitle>
        <CardDescription>
          {shop
            ? "Buyers will see this on your public shop page."
            : "Create your shop first — you'll be able to add products once it's set up."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="shop-name">Shop name</Label>
            <Input id="shop-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gulabo Studio" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-instagram">Instagram handle</Label>
            <Input
              id="shop-instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@yourshop"
            />
            <p className="text-xs text-muted-foreground">
              This becomes your shop's public link: myinstashop.in/shop/{instagram.trim().replace(/^@/, "").toLowerCase() || "yourshop"}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="What do you sell?" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-description">Description</Label>
            <Textarea
              id="shop-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell buyers what your shop is about"
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving…" : shop ? "Save changes" : "Create shop"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ProductsPanel({ shop }: { shop: Shop }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["seller-products"],
    queryFn: () => adminGetJSON<{ products: Product[] }>("/api/seller/products"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteJSON(`/api/seller/products/${id}`),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not delete product"),
  });

  return (
    <div className="space-y-6">
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

      <AddProductForm shopHandle={shop.instagram} />

      <div className="space-y-3">
        <h2 className="text-lg font-display font-semibold text-foreground">
          Your products {data?.products ? `(${data.products.length})` : ""}
        </h2>
        {isLoading && <Skeleton className="h-32 w-full rounded-2xl" />}
        {!isLoading && data?.products.length === 0 && (
          <p className="text-sm text-muted-foreground">No products yet — add your first one above.</p>
        )}
        {!isLoading && data?.products && data.products.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.products.map((product) => (
              <Card key={product._id} className="overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="h-40 w-full object-cover" />
                <CardContent className="space-y-1 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{product.name}</p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${product.name}`}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This can't be undone. Buyers will no longer see this product on your shop page.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(product._id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ₹{product.price.toLocaleString("en-IN")}
                    {product.deliveryCharge > 0 ? ` + ₹${product.deliveryCharge} delivery` : " · Free delivery"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddProductForm({ shopHandle }: { shopHandle: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const addMutation = useMutation({
    mutationFn: () =>
      adminPostJSON("/api/seller/products", {
        name,
        imageUrl,
        price: Number(price),
        deliveryCharge: deliveryCharge ? Number(deliveryCharge) : 0,
        description,
      }),
    onSuccess: () => {
      toast.success("Product added");
      setName("");
      setPrice("");
      setDeliveryCharge("");
      setDescription("");
      setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add product"),
  });

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setImageUploading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !imageUrl || !price) {
      toast.error("Add a product name, image and price");
      return;
    }
    addMutation.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a product</CardTitle>
        <CardDescription>This will appear on your shop page at myinstashop.in/shop/{shopHandle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product name</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Handwoven Cotton Kurta"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-image">Product image</Label>
            <label
              htmlFor="product-image"
              className="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/30 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {imageUploading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : imageUrl ? (
                <img src={imageUrl} alt="Product preview" className="h-full w-full rounded-xl object-cover" />
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
              <Input
                id="product-price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-delivery">Delivery charge (₹)</Label>
              <Input
                id="product-delivery"
                type="number"
                min="0"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                placeholder="0 for free delivery"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fabric, sizing, care instructions, etc."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={addMutation.isPending || imageUploading}>
            {addMutation.isPending ? "Adding…" : "Add product"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
