import "server-only";
import type { TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const authorSelect = { select: { id: true, email: true } } as const;
const replyInclude = {
  replies: {
    include: { author: { select: { email: true, role: true } } },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export async function createTicket(input: { authorId: string; subject: string; message: string }) {
  return prisma.ticket.create({ data: input });
}

export async function listTicketsForUser(userId: string) {
  return prisma.ticket.findMany({
    where: { authorId: userId },
    include: replyInclude,
    orderBy: { createdAt: "desc" },
  });
}

export interface AdminTicketFilter {
  status?: TicketStatus;
  onlyUnread?: boolean;
}

export async function listAllTickets(filter: AdminTicketFilter = {}) {
  return prisma.ticket.findMany({
    where: {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.onlyUnread ? { isRead: false } : {}),
    },
    include: {
      author: authorSelect,
      claimedBy: authorSelect,
    },
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
  });
}

export async function countUnreadTickets(): Promise<number> {
  return prisma.ticket.count({ where: { isRead: false } });
}

/** Retorna o ticket completo, ou `null` se não existir. Não checa permissão — quem chama decide quem pode ver. */
export async function getTicketDetail(ticketId: string) {
  return prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      author: authorSelect,
      claimedBy: authorSelect,
      ...replyInclude,
    },
  });
}

export async function markTicketRead(ticketId: string) {
  await prisma.ticket.update({ where: { id: ticketId }, data: { isRead: true } });
}

export async function claimTicket(ticketId: string, adminId: string) {
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { claimedById: adminId, status: "em_atendimento", isRead: true },
  });
}

export async function addTicketReply(ticketId: string, authorId: string, content: string) {
  const reply = await prisma.ticketReply.create({
    data: { ticketId, authorId, content },
    include: { author: { select: { email: true, role: true } } },
  });
  // Uma resposta nova conta como "o ticket já foi visto" — evita ficar
  // marcado como não lido depois de alguém já ter interagido com ele.
  await prisma.ticket.update({ where: { id: ticketId }, data: { isRead: true } });
  return reply;
}

export async function resolveTicket(ticketId: string) {
  await prisma.ticket.update({ where: { id: ticketId }, data: { status: "resolvido" } });
}
