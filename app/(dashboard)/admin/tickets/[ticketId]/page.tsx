import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/dal";
import { getTicketDetail } from "@/services/TicketService";
import { TicketThread } from "@/components/shared/ticket-thread";
import { TicketReplyForm } from "@/components/shared/ticket-reply-form";
import { TicketAdminActions } from "@/components/shared/ticket-admin-actions";

export const metadata: Metadata = {
  title: "Ticket",
  robots: { index: false, follow: false },
};

export default async function AdminTicketDetailPage(props: PageProps<"/admin/tickets/[ticketId]">) {
  await requireRole("admin");
  const { ticketId } = await props.params;

  const ticket = await getTicketDetail(ticketId);
  if (!ticket) notFound();

  return (
    <div className="space-y-4">
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Voltar para todos os tickets
      </Link>

      <TicketThread
        subject={ticket.subject}
        message={ticket.message}
        status={ticket.status}
        authorEmail={ticket.author.email}
        createdAt={ticket.createdAt}
        replies={ticket.replies}
      />

      <Card>
        <CardContent className="pt-4">
          <TicketAdminActions
            ticketId={ticket.id}
            isRead={ticket.isRead}
            isClaimed={ticket.claimedById !== null}
            isResolved={ticket.status === "resolvido"}
          />
        </CardContent>
      </Card>

      {ticket.status !== "resolvido" && (
        <Card>
          <CardContent className="pt-4">
            <TicketReplyForm ticketId={ticket.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
