import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { adminDeleteJSON, adminGetJSON, adminPostJSON, clearAdminSession } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/promo-codes")({
  head: () => ({ meta: [{ title: "Manage Promo Codes — Instashop Admin" }] }),
  component: () => <RequireAdmin>{() => <ManagePromoCodes />}</RequireAdmin>,
});

type PromoCodeRow = {
  code: string;
  ownerName: string;
  amount: number;
  active: boolean;
  count: number;
  totalAmount: number;
};

function ManagePromoCodes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [ownerName, setOwnerName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-promo-codes", "yearly"],
    queryFn: () => adminGetJSON<{ promoCodes: PromoCodeRow[] }>(`/api/admin/promo-codes?range=yearly`),
  });

  const addMutation = useMutation({
    mutationFn: () => adminPostJSON("/api/admin/promo-codes", { code, amount: Number(amount), ownerName }),
    onSuccess: () => {
      toast.success(`Promo code ${code.trim().toUpperCase()} added`);
      setCode("");
      setAmount("");
      setOwnerName("");
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add promo code"),
  });

  const deleteMutation = useMutation({
    mutationFn: (codeToDelete: string) => adminDeleteJSON(`/api/admin/promo-codes/${codeToDelete}`),
    onSuccess: (_data, codeToDelete) => {
      toast.success(`Promo code ${codeToDelete} deleted`);
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not delete promo code"),
  });

  function handleLogout() {
    clearAdminSession();
    navigate({ to: "/admin/login" });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !amount) {
      toast.error("Enter a code and an amount");
      return;
    }
    addMutation.mutate();
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> Back
            </Link>
            <h1 className="mt-2 text-2xl font-display font-semibold text-foreground">Manage Promo Codes</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add a promo code</CardTitle>
            <CardDescription>Sellers can use this code at checkout for the listed price.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. LAUNCH50"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  placeholder="999"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner name (optional)</Label>
                <Input
                  id="ownerName"
                  placeholder="e.g. Uzma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
              <Button type="submit" className="sm:col-span-3" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding…" : "Add promo code"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8">
          {isLoading && <Skeleton className="h-48 w-full rounded-2xl" />}

          {!isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Used this year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.promoCodes.map((promo) => (
                  <TableRow key={promo.code}>
                    <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                    <TableCell>{promo.ownerName || "—"}</TableCell>
                    <TableCell>₹{promo.amount.toLocaleString("en-IN")}</TableCell>
                    <TableCell>{promo.count}</TableCell>
                    <TableCell>
                      <Badge variant={promo.active ? "default" : "secondary"}>{promo.active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Delete ${promo.code}`}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete promo code {promo.code}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This can't be undone. Sellers will no longer be able to use this code at checkout.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(promo.code)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.promoCodes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      No promo codes yet.
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
