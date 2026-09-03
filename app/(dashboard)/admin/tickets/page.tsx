import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/dal";
import { listAllTickets } from "@/services/TicketService";
import { TICKET_STATUS_LABELS } from "@/types/ticket";
import { TicketAdminActions } from "@/components/shared/ticket-admin-actions";

export const metadata: Metadata = {
  title: "Tickets",
  robots: { index: false, follow: false },
};

const STATUS_BADGE_VARIANT = {
  aberto: "secondary",
  em_atendimento: "default",
  resolvido: "outline",
} as const;

export default async function AdminTicketsPage() {
  await requireRole("admin");
  const tickets = await listAllTickets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tickets de suporte</h1>
        <p className="text-muted-foreground">
          Chamados abertos pelos usuários com a administração do AreaVon.
        </p>
      </div>

      {tickets.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum ticket aberto até agora.</p>
      )}

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className={!ticket.isRead ? "border-signal-blue/40" : undefined}>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/admin/tickets/${ticket.id}`} className="font-medium hover:underline">
                    {!ticket.isRead && <span className="mr-1.5 inline-block size-2 rounded-full bg-signal-blue" />}
                    {ticket.subject}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {ticket.author.email} · {ticket.createdAt.toLocaleString("pt-BR")}
                    {ticket.claimedBy && ` · reivindicado por ${ticket.claimedBy.email}`}
                  </p>
                </div>
                <Badge variant={STATUS_BADGE_VARIANT[ticket.status]} className="shrink-0">
                  {TICKET_STATUS_LABELS[ticket.status]}
                </Badge>
              </div>

              <p className="line-clamp-2 text-sm text-muted-foreground">{ticket.message}</p>

              <TicketAdminActions
                ticketId={ticket.id}
                isRead={ticket.isRead}
                isClaimed={ticket.claimedById !== null}
                isResolved={ticket.status === "resolvido"}
                size="xs"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
