import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { SellerProductDashboard } from "@/components/admin/SellerProductDashboard";
import { adminGetJSON, clearAdminSession, type AdminSession } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Instashop" }] }),
  component: () => <RequireAdmin>{(session) => <AdminDashboard session={session} />}</RequireAdmin>,
});

type Range = "daily" | "monthly" | "yearly";

type PromoCodeStat = {
  code: string;
  ownerName: string;
  amount: number;
  active: boolean;
  count: number;
  totalAmount: number;
};

type SellersSummary = {
  totalSellers: number;
  count: number;
};

const RANGE_LABEL: Record<Range, string> = { daily: "today", monthly: "this month", yearly: "this year" };

function AdminDashboard({ session }: { session: AdminSession }) {
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("daily");
  const isSeller = session.role === "seller";

  const { data, isLoading } = useQuery({
    queryKey: ["admin-promo-codes", range],
    queryFn: () => adminGetJSON<{ range: Range; promoCodes: PromoCodeStat[] }>(`/api/admin/promo-codes?range=${range}`),
    enabled: !isSeller,
  });

  const { data: sellersSummary, isLoading: sellersLoading } = useQuery({
    queryKey: ["admin-sellers-summary", range],
    queryFn: () => adminGetJSON<SellersSummary>(`/api/admin/sellers?range=${range}`),
    enabled: !isSeller,
  });

  function handleLogout() {
    clearAdminSession();
    navigate({ to: "/admin/login" });
  }

  if (isSeller) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-end">
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
          <SellerProductDashboard session={session} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Promo code usage across all sellers.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin/sellers">
              <Button variant="outline">Sellers</Button>
            </Link>
            <Link to="/admin/promo-codes">
              <Button variant="outline">Manage Promo Codes</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList>
              <TabsTrigger value="daily">Today</TabsTrigger>
              <TabsTrigger value="monthly">This month</TabsTrigger>
              <TabsTrigger value="yearly">This year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link to="/admin/sellers">
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total sellers (all time)</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {sellersLoading ? "…" : sellersSummary?.totalSellers ?? 0}
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/sellers">
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">New sellers ({RANGE_LABEL[range]})</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {sellersLoading ? "…" : sellersSummary?.count ?? 0}
              </CardContent>
            </Card>
          </Link>
        </div>

        <h2 className="mt-8 text-lg font-display font-semibold text-foreground">Promo Codes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}

          {!isLoading &&
            data?.promoCodes.map((promo) => (
              <Link key={promo.code} to="/admin/promo/$code" params={{ code: promo.code }}>
                <Card className="h-full transition-colors hover:border-primary">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="font-mono text-base">{promo.code}</CardTitle>
                    <Badge variant={promo.count > 0 ? "default" : "secondary"}>{promo.count}</Badge>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {promo.ownerName && <p>{promo.ownerName}</p>}
                    <p>₹{promo.totalAmount.toLocaleString("en-IN")} collected</p>
                    {!promo.active && <p className="mt-1 text-destructive">Inactive</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}

          {!isLoading && data?.promoCodes.length === 0 && (
            <p className="text-sm text-muted-foreground">No promo codes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
