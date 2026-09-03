import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { verifySession } from "@/lib/dal";
import { getTicketDetail } from "@/services/TicketService";
import { LogoutButton } from "@/components/shared/logout-button";
import { TicketThread } from "@/components/shared/ticket-thread";
import { TicketReplyForm } from "@/components/shared/ticket-reply-form";

export const metadata: Metadata = {
  title: "Ticket",
  robots: { index: false, follow: false },
};

export default async function SuporteTicketPage(props: PageProps<"/suporte/[ticketId]">) {
  const session = await verifySession();
  const { ticketId } = await props.params;

  const ticket = await getTicketDetail(ticketId);
  if (!ticket) notFound();
  // Só o autor (ou um admin, via /admin/tickets) pode ver o ticket.
  if (ticket.authorId !== session.user.id && session.user.role !== "admin") {
    redirect("/suporte");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          AreaVon
        </Link>
        <LogoutButton />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <Link
          href="/suporte"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Voltar aos seus tickets
        </Link>

        <TicketThread
          subject={ticket.subject}
          message={ticket.message}
          status={ticket.status}
          authorEmail={ticket.author.email}
          createdAt={ticket.createdAt}
          replies={ticket.replies}
        />

        {ticket.status !== "resolvido" && (
          <Card className="mt-4">
            <CardContent className="pt-4">
              <TicketReplyForm ticketId={ticket.id} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
