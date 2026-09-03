import type { ReactNode } from "react";
import { DashboardNav } from "@/components/shared/dashboard-nav";
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
        <DashboardNav email={session.user.email ?? ""} role={session.user.role} />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
