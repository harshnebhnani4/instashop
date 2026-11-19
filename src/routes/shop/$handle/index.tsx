import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnnouncementBar, Navbar } from "@/components/home/Top";
import { Footer } from "@/components/home/Bottom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getJSON } from "@/lib/api";

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
};

export const Route = createFileRoute("/shop/$handle/")({
  component: ShopPage,
});

function ShopPage() {
  const { handle } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["shop", handle],
    queryFn: () => getJSON<{ shop: Shop; products: Product[] }>(`/api/shops/${handle}`),
  });

  return (
    <main className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:pt-32">
        {isLoading && <Skeleton className="h-64 w-full rounded-[2rem]" />}

        {error && <p className="text-center text-muted-foreground">This shop doesn't exist.</p>}

        {data && (
          <>
            {data.shop.bannerUrl && (
              <img
                src={data.shop.bannerUrl}
                alt=""
                className="h-48 w-full rounded-[2rem] object-cover sm:h-64"
              />
            )}
            <div className="mt-[-2.5rem] flex items-end gap-4 px-2 sm:mt-[-3rem]">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-background bg-blush shadow-card sm:h-24 sm:w-24">
                {data.shop.logoUrl ? (
                  <img src={data.shop.logoUrl} alt={data.shop.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-2xl font-extrabold text-primary">{data.shop.name[0]}</span>
                )}
              </div>
              <div>
                <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{data.shop.name}</h1>
                <p className="text-sm text-muted-foreground">@{data.shop.instagram}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 px-2">
              <Badge variant="secondary">{data.shop.category}</Badge>
            </div>

            {data.shop.description && <p className="mt-4 max-w-2xl px-2 text-muted-foreground">{data.shop.description}</p>}

            <h2 className="mt-10 px-2 font-display text-xl font-semibold">Products</h2>
            {data.products.length === 0 ? (
              <p className="mt-3 px-2 text-sm text-muted-foreground">This shop hasn't added any products yet.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 px-2 sm:grid-cols-3 lg:grid-cols-4">
                {data.products.map((product) => (
                  <Link key={product._id} to="/shop/$handle/$productId" params={{ handle, productId: product._id }}>
                    <Card className="h-full overflow-hidden transition-transform hover:scale-[1.02]">
                      <img src={product.imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
                      <CardContent className="p-3">
                        <p className="truncate text-sm font-semibold">{product.name}</p>
                        <p className="text-sm text-primary">₹{product.price.toLocaleString("en-IN")}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
