import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/shared/logout-button";
import { verifySession } from "@/lib/dal";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await verifySession();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold tracking-tight">
              CodeVision Radar
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/radar" className="hover:text-foreground">
                Radar
              </Link>
              <Link href="/crm" className="hover:text-foreground">
                CRM
              </Link>
              <Link href="/equipe" className="hover:text-foreground">
                Equipe
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
            <Badge variant="secondary" className="capitalize">
              {session.user.role}
            </Badge>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
