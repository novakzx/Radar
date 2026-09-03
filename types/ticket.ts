import type { TicketStatus } from "@prisma/client";

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  aberto: "Aberto",
  em_atendimento: "Em atendimento",
  resolvido: "Resolvido",
};
