import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Eye, EyeOff, Store, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getJSON, postJSON } from "@/lib/api";
import { loadRazorpayScript } from "@/lib/razorpay";
import { cn } from "@/lib/utils";

const DEFAULT_AMOUNT = 1499;

const SELLER_CATEGORIES = [
  "Clothes",
  "Shoes",
  "Crochet",
  "Jewellery",
  "Beauty",
  "Home Decor",
  "Accessories",
  "Handmade",
  "Other",
] as const;

const sellerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().regex(/^\+?[0-9]{10,13}$/, "Enter a valid phone number"),
  instagram: z.string().trim().min(2, "Enter your Instagram handle").transform((v) => v.replace(/^@/, "")),
  category: z.enum(SELLER_CATEGORIES, { message: "Pick a category" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  promoCode: z.string().trim().optional(),
});

type SellerFormValues = z.infer<typeof sellerSchema>;

export function SellerDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [promoStatus, setPromoStatus] = useState<{ state: "idle" | "checking" | "valid" | "invalid"; amount: number | null }>({
    state: "idle",
    amount: null,
  });
  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchema),
    defaultValues: { name: "", email: "", phone: "", instagram: "", password: "", promoCode: "" },
  });

  const promoCode = form.watch("promoCode");

  useEffect(() => {
    const code = (promoCode ?? "").trim();
    if (!code) {
      setPromoStatus({ state: "idle", amount: null });
      return;
    }
    setPromoStatus({ state: "checking", amount: null });
    const id = setTimeout(() => {
      getJSON<{ amount: number }>(`/api/payments/promo-code?code=${encodeURIComponent(code)}`)
        .then((res) => setPromoStatus({ state: "valid", amount: res.amount }))
        .catch(() => setPromoStatus({ state: "invalid", amount: null }));
    }, 500);
    return () => clearTimeout(id);
  }, [promoCode]);

  const amount = promoStatus.state === "valid" && promoStatus.amount != null ? promoStatus.amount : DEFAULT_AMOUNT;

  async function onSubmit(values: SellerFormValues) {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Couldn't load the payment window. Check your connection and try again.");
        return;
      }

      const order = await postJSON<{ orderId: string; amount: number; currency: string; keyId: string }>(
        "/api/payments/create-order",
        values,
      );

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Instashop",
        description: "Seller listing fee",
        order_id: order.orderId,
        prefill: { name: values.name, email: values.email, contact: values.phone },
        theme: { color: "#E27396" },
        handler: async (response) => {
          try {
            await postJSON("/api/payments/verify", { ...values, ...response });
            toast.success("Payment successful — you're on the list!", {
              description: `We'll reach out to @${values.instagram} within 24 hours to set up your shop.`,
            });
            form.reset();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Payment succeeded but we couldn't save your details.");
          }
        },
        modal: {
          // Re-open our dialog (with the entered details intact) if the user
          // backs out of Razorpay's checkout instead of completing payment.
          ondismiss: () => setOpen(true),
        },
      });

      // Close our own dialog first: Radix's focus trap and pointer-events lock
      // otherwise fight Razorpay's checkout overlay for clicks/focus, making its
      // buttons unresponsive until the trap happens to let a click through.
      setOpen(false);
      razorpay.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/*
        Grid with explicit rows: header takes its natural height, the form gets
        the remaining space and can shrink (minmax(0,1fr)) so it scrolls
        internally instead of being clipped or scrolling the page.
        90dvh accounts for mobile browser toolbars.
      */}
      <DialogContent className="grid max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[2rem] border-0 bg-card p-0 shadow-card sm:max-w-md">
        <div className="bg-hero grain rounded-t-[2rem] px-6 pb-6 pt-7">
          <DialogHeader>
            <span className="mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </span>
            <DialogTitle className="font-display text-2xl font-extrabold">Start selling on Instashop</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tell us about your shop and we'll get you listed.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="space-y-4 overflow-y-auto overscroll-contain px-6 pb-8 pt-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Riya Sharma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram account</FormLabel>
                  <FormControl>
                    <Input placeholder="@yourshop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="What do you sell?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SELLER_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Create a password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <p className="text-[0.8rem] text-muted-foreground">
                    You'll use this to log in and manage your shop later.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="promoCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo code <span className="font-normal text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. LAUNCH50" {...field} />
                  </FormControl>
                  {promoStatus.state === "valid" && (
                    <p className="flex items-center gap-1 text-[0.8rem] font-medium text-forest">
                      <Check className="h-3.5 w-3.5" /> Promo code applied — ₹{promoStatus.amount?.toLocaleString("en-IN")}
                    </p>
                  )}
                  {promoStatus.state === "invalid" && (
                    <p className="flex items-center gap-1 text-[0.8rem] font-medium text-destructive">
                      <X className="h-3.5 w-3.5" /> Wrong promo code
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between rounded-2xl bg-blush px-4 py-3.5">
              <span className="text-sm font-semibold">One-time listing fee</span>
              <span className="flex items-baseline gap-2">
                {promoStatus.state === "valid" && (
                  <span className="text-sm text-muted-foreground line-through">₹{DEFAULT_AMOUNT.toLocaleString("en-IN")}</span>
                )}
                <span className="font-display text-lg font-extrabold text-primary">₹{amount.toLocaleString("en-IN")}</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={form.formState.isSubmitting || promoStatus.state === "checking" || promoStatus.state === "invalid"}
              className={cn(
                "shimmer w-full rounded-full bg-primary py-3.5 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {form.formState.isSubmitting ? "Starting payment…" : `Pay ₹${amount.toLocaleString("en-IN")}`}
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}