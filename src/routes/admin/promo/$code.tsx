import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { adminGetJSON, clearAdminSession } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/promo/$code")({
  head: () => ({ meta: [{ title: "Promo Code — Instashop Admin" }] }),
  component: () => <RequireAdmin>{() => <PromoDetail />}</RequireAdmin>,
});

type Range = "daily" | "monthly" | "yearly";

type SellerRow = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  category: string;
  amount: number;
  createdAt: string;
};

function PromoDetail() {
  const { code } = useParams({ from: "/admin/promo/$code" });
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("daily");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-promo-sellers", code, range],
    queryFn: () =>
      adminGetJSON<{ range: Range; code: string; count: number; totalAmount: number; sellers: SellerRow[] }>(
        `/api/admin/promo-codes/${code}/sellers?range=${range}`,
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
            <h1 className="mt-2 font-mono text-2xl font-semibold text-foreground">{code}</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
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

        {error && <p className="mt-6 text-sm text-destructive">{error.message}</p>}

        {!error && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Times used</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="text-base">{isLoading ? "…" : data?.count ?? 0}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total collected</CardTitle>
              </CardHeader>
              <CardContent className="text-lg font-semibold">
                ₹{(data?.totalAmount ?? 0).toLocaleString("en-IN")}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8">
          {isLoading && <Skeleton className="h-48 w-full rounded-2xl" />}

          {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Instagram</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead>
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
                    <TableCell>₹{(seller.amount ?? 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(seller.createdAt).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
                {data?.sellers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      No sellers used this code in this range.
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
