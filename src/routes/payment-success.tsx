import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PaymentSuccessSearch = {
  status: "success" | "error";
  payment_id: string | undefined;
  instagram: string | undefined;
};

export const Route = createFileRoute("/payment-success")({
  head: () => ({ meta: [{ title: "Payment Successful — Instashop" }] }),
  validateSearch: (search: Record<string, unknown>): PaymentSuccessSearch => ({
    status: search["status"] === "error" ? "error" : "success",
    payment_id: typeof search["payment_id"] === "string" ? search["payment_id"] : undefined,
    instagram: typeof search["instagram"] === "string" ? search["instagram"] : undefined,
  }),
  component: PaymentSuccess,
});

const REDIRECT_SECONDS = 5;

function PaymentSuccess() {
  const { status, payment_id, instagram } = Route.useSearch();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const isSuccess = status !== "error";

  useEffect(() => {
    if (!isSuccess) return;
    const interval = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    const timeout = setTimeout(() => navigate({ to: "/" }), REDIRECT_SECONDS * 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isSuccess, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader className="items-center">
          {isSuccess ? (
            <CheckCircle2 className="h-14 w-14 text-forest" />
          ) : (
            <XCircle className="h-14 w-14 text-destructive" />
          )}
          <CardTitle className="font-display text-2xl font-extrabold">
            {isSuccess ? "Payment successful! 🎉" : "Something went wrong"}
          </CardTitle>
          <CardDescription>
            {isSuccess
              ? `You're on the list${instagram ? ` — we'll reach out to @${instagram} within 24 hours` : ""}.`
              : "We couldn't confirm this payment. If you were charged, contact support."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSuccess && payment_id && (
            <p className="rounded-xl bg-blush px-4 py-2 font-mono text-xs text-muted-foreground">
              Transaction ID: {payment_id}
            </p>
          )}
          <Button asChild className="w-full">
            <Link to="/">Go to homepage</Link>
          </Button>
          {isSuccess && (
            <p className="text-xs text-muted-foreground">Redirecting to homepage in {secondsLeft}s…</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
