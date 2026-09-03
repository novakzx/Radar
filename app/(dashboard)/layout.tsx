import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/shared/dashboard-nav";
import { verifySession } from "@/lib/dal";
import { userHasPaidAccess } from "@/services/PaymentService";
import { requiresPayment } from "@/lib/payment-gate";
import { countUnreadTickets } from "@/services/TicketService";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await verifySession();

  // Gate de pagamento: admin sempre passa; membro precisa ter pago os
  // €2 (confirmado pelo webhook do Stripe — nunca por um valor vindo do
  // client). Consultado fresco no banco a cada navegação, então o
  // acesso é liberado assim que o webhook grava `hasPaid = true`, sem
  // precisar de novo login.
  const hasPaid = session.user.role === "admin" ? true : await userHasPaidAccess(session.user.id);
  if (requiresPayment({ role: session.user.role, hasPaid })) {
    redirect("/pagamento");
  }

  const unreadTickets = session.user.role === "admin" ? await countUnreadTickets() : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <DashboardNav
          email={session.user.email ?? ""}
          role={session.user.role}
          unreadTickets={unreadTickets}
        />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
