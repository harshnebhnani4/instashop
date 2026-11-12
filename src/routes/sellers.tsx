import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, MessageCircle, Sparkles } from "lucide-react";
import { AnnouncementBar, Navbar } from "@/components/home/Top";
import { Footer } from "@/components/home/Bottom";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { postJSON } from "@/lib/api";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "918103146100";

const CATEGORIES = [
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

const leadSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email"),
  instagram: z.string().trim().min(2, "Enter your Instagram handle").transform((v) => v.replace(/^@/, "")),
  category: z.enum(CATEGORIES, { message: "Pick a category" }),
  whatsapp: z.string().trim().regex(/^\+?[0-9]{10,13}$/, "Enter a valid WhatsApp number"),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export const Route = createFileRoute("/sellers")({
  head: () => ({
    meta: [
      { title: "Become a Founding Seller — Instashop" },
      { name: "description", content: "Join Instashop as a founding seller. ₹1499 one-time, launching 1 January." },
    ],
  }),
  component: SellersPage,
});

function SellersPage() {
  const [submitted, setSubmitted] = useState<LeadFormValues | null>(null);

  return (
    <main className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-28 sm:pt-32">
        {submitted ? <ThankYou values={submitted} /> : <LeadForm onSubmitted={setSubmitted} />}
      </div>
      <Footer />
    </main>
  );
}

function LeadForm({ onSubmitted }: { onSubmitted: (values: LeadFormValues) => void }) {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", email: "", instagram: "", whatsapp: "" },
  });

  async function onSubmit(values: LeadFormValues) {
    try {
      await postJSON("/api/leads", values);
      onSubmitted(values);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <div className="text-center">
        <Badge className="mb-4">Founding Seller · Launches 1 January</Badge>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Be one of our first sellers
        </h1>
        <div className="mx-auto mt-4 max-w-md space-y-1 text-muted-foreground">
          <p>Get listed before we go live and lock in founding-seller pricing for good.</p>
          <p>One-time ₹1499 fee — no commissions, no monthly charges, ever.</p>
          <p>We're onboarding founding sellers personally, so spots are limited.</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl bg-blush px-5 py-4">
        <span className="text-sm font-semibold">Founding seller fee</span>
        <span className="font-display text-xl font-extrabold text-primary">₹1,499</span>
      </div>

      <ul className="mt-6 space-y-3 rounded-[2rem] bg-card p-6 shadow-card">
        <li className="font-semibold">What you get for ₹1,499:</li>
        {[
          "Your own shop page on Instashop with your branding",
          "Your products listed and ready for buyers to browse and order",
          "Promotion to buyers on our Instagram as part of the 1 January launch",
        ].map((line) => (
          <li key={line} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
            {line}
          </li>
        ))}
      </ul>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4 rounded-[2rem] bg-card p-6 shadow-card">
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
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shop's Instagram handle</FormLabel>
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
                    {CATEGORIES.map((c) => (
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
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="9876543210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={cn(
              "shimmer w-full rounded-full bg-primary py-3.5 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {form.formState.isSubmitting ? "Submitting…" : "Apply for a founding seller spot"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            No payment now. We'll message you on WhatsApp to confirm your spot.
          </p>
        </form>
      </Form>
    </>
  );
}

function ThankYou({ values }: { values: LeadFormValues }) {
  const message = `Hi, I'm ${values.name}, my shop is @${values.instagram}, I filled the founding seller form.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <div className="rounded-[2rem] bg-card p-8 text-center shadow-card">
      <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
        <Sparkles className="h-6 w-6" />
      </span>
      <h1 className="font-display text-2xl font-extrabold">You're on the list, {values.name}!</h1>
      <p className="mt-2 text-muted-foreground">
        We've got your details for @{values.instagram}. Tap below to message us directly on WhatsApp — we usually reply within 10 minutes.
      </p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3.5 font-semibold text-forest-foreground shadow-glow transition-transform hover:scale-[1.01]"
      >
        <MessageCircle className="h-5 w-5" />
        Chat with us on WhatsApp
      </a>
    </div>
  );
}
