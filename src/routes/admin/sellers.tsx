import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { adminGetJSON, clearAdminSession } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/sellers")({
  head: () => ({ meta: [{ title: "Sellers — Instashop Admin" }] }),
  component: () => <RequireAdmin>{() => <SellersOverview />}</RequireAdmin>,
});

type Range = "daily" | "monthly" | "yearly";

type SellerRow = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  category: string;
  promoCode: string;
  amount: number;
  createdAt: string;
};

const RANGE_LABEL: Record<Range, string> = { daily: "today", monthly: "this month", yearly: "this year" };

function SellersOverview() {
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("daily");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-sellers", range],
    queryFn: () =>
      adminGetJSON<{ range: Range; totalSellers: number; count: number; totalAmount: number; sellers: SellerRow[] }>(
        `/api/admin/sellers?range=${range}`,
      ),
  });

  function handleLogout() {
    clearAdminSession();
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> Back
            </Link>
            <h1 className="mt-2 text-2xl font-display font-semibold text-foreground">Sellers</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total sellers (all time)</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{isLoading ? "…" : data?.totalSellers ?? 0}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">New sellers ({RANGE_LABEL[range]})</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{isLoading ? "…" : data?.count ?? 0}</CardContent>
          </Card>
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

        <div className="mt-6">
          {isLoading && <Skeleton className="h-48 w-full rounded-2xl" />}

          {!isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Instagram</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Promo code</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.sellers.map((seller) => (
                  <TableRow key={seller._id}>
                    <TableCell className="font-medium">{seller.name}</TableCell>
                    <TableCell>@{seller.instagram}</TableCell>
                    <TableCell>{seller.category}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {seller.email}
                      <br />
                      {seller.phone}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{seller.promoCode || "—"}</TableCell>
                    <TableCell>₹{(seller.amount ?? 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(seller.createdAt).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
                {data?.sellers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      No sellers signed up in this range.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
