import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { getAdminSession, type AdminSession } from "@/lib/adminAuth";

export function RequireAdmin({ children }: { children: (session: AdminSession) => ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const existing = getAdminSession();
    if (!existing) {
      navigate({ to: "/admin/login" });
      return;
    }
    setSession(existing);
    setChecked(true);
  }, [navigate]);

  if (!checked || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return <>{children(session)}</>;
}
