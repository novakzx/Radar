import { Badge } from "@/components/ui/badge";
import { TICKET_STATUS_LABELS } from "@/types/ticket";
import type { TicketStatus } from "@prisma/client";

interface TicketThreadProps {
  subject: string;
  message: string;
  status: TicketStatus;
  authorEmail: string;
  createdAt: Date;
  replies: {
    id: string;
    content: string;
    createdAt: Date;
    author: { email: string; role: string };
  }[];
}

const STATUS_BADGE_VARIANT: Record<TicketStatus, "secondary" | "default" | "outline"> = {
  aberto: "secondary",
  em_atendimento: "default",
  resolvido: "outline",
};

export function TicketThread({ subject, message, status, authorEmail, createdAt, replies }: TicketThreadProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{subject}</h1>
          <Badge variant={STATUS_BADGE_VARIANT[status]}>{TICKET_STATUS_LABELS[status]}</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Aberto por {authorEmail} em {createdAt.toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 text-sm whitespace-pre-wrap">
        {message}
      </div>

      {replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="rounded-2xl border border-border bg-card/60 p-4 text-sm whitespace-pre-wrap"
            >
              <p>{reply.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {reply.author.email}
                {reply.author.role === "admin" ? " · equipe AreaVon" : ""} ·{" "}
                {reply.createdAt.toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
