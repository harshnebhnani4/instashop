import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Store } from "lucide-react";
import { AnnouncementBar, Navbar } from "@/components/home/Top";
import { Footer } from "@/components/home/Bottom";
import { Skeleton } from "@/components/ui/skeleton";
import { getJSON } from "@/lib/api";

type Shop = {
  name: string;
  instagram: string;
  logoUrl: string;
};

type Product = {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
  deliveryCharge: number;
  description: string;
};

export const Route = createFileRoute("/shop/$handle/$productId")({
  component: ProductPage,
});

function ProductPage() {
  const { handle, productId } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["product", handle, productId],
    queryFn: () => getJSON<{ product: Product; shop: Shop }>(`/api/shops/${handle}/products/${productId}`),
  });

  return (
    <main className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:pt-32">
        <Link to="/shop/$handle" params={{ handle }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to shop
        </Link>

        {isLoading && <Skeleton className="mt-6 h-96 w-full rounded-[2rem]" />}
        {error && <p className="mt-6 text-center text-muted-foreground">This product doesn't exist.</p>}

        {data && (
          <div className="mt-6 overflow-hidden rounded-[2rem] bg-card shadow-card sm:grid sm:grid-cols-2">
            <img src={data.product.imageUrl} alt={data.product.name} className="aspect-square w-full object-cover" />
            <div className="p-6 sm:p-8">
              <h1 className="font-display text-2xl font-extrabold tracking-tight">{data.product.name}</h1>
              <p className="mt-2 font-display text-xl font-extrabold text-primary">
                ₹{data.product.price.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.product.deliveryCharge > 0
                  ? `+ ₹${data.product.deliveryCharge.toLocaleString("en-IN")} delivery`
                  : "Free delivery"}
              </p>
              {data.product.description && <p className="mt-4 text-muted-foreground">{data.product.description}</p>}

              <Link
                to="/shop/$handle"
                params={{ handle }}
                className="mt-6 flex items-center gap-3 rounded-2xl bg-blush px-4 py-3 transition-colors hover:bg-amaranth/30"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-background">
                  {data.shop.logoUrl ? (
                    <img src={data.shop.logoUrl} alt={data.shop.name} className="h-full w-full object-cover" />
                  ) : (
                    <Store className="size-4 text-primary" />
                  )}
                </span>
                <span>
                  <span className="block text-xs text-muted-foreground">Sold by</span>
                  <span className="block font-semibold">{data.shop.name}</span>
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
