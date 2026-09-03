import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { verifySession } from "@/lib/dal";
import { listTicketsForUser } from "@/services/TicketService";
import { TICKET_STATUS_LABELS } from "@/types/ticket";
import { LogoutButton } from "@/components/shared/logout-button";
import { CreateTicketForm } from "@/components/shared/create-ticket-form";

export const metadata: Metadata = {
  title: "Suporte",
  robots: { index: false, follow: false },
};

const STATUS_BADGE_VARIANT = {
  aberto: "secondary",
  em_atendimento: "default",
  resolvido: "outline",
} as const;

export default async function SuportePage() {
  const session = await verifySession();
  const tickets = await listTicketsForUser(session.user.id);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          AreaVon
        </Link>
        <LogoutButton />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Suporte</h1>
        <p className="text-muted-foreground">
          Abra um ticket com a administração do AreaVon — respondemos por aqui mesmo.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Abrir novo ticket</CardTitle>
            <CardDescription>Descreva o problema com o máximo de detalhes possível.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTicketForm />
          </CardContent>
        </Card>

        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Seus tickets
          </h2>
          {tickets.length === 0 && (
            <p className="text-sm text-muted-foreground">Você ainda não abriu nenhum ticket.</p>
          )}
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/suporte/${ticket.id}`}>
              <Card className="transition-colors hover:border-signal-blue/40">
                <CardContent className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.createdAt.toLocaleString("pt-BR")} · {ticket.replies.length}{" "}
                      resposta{ticket.replies.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANT[ticket.status]} className="shrink-0">
                    {TICKET_STATUS_LABELS[ticket.status]}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
