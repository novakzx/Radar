import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  PeriodicReportData,
  ReportPeriod,
  TeamMessageItem,
  TeamReminderItem,
  UpcomingMeetingItem,
} from "@/types/team";

const MESSAGE_HISTORY_LIMIT = 100;

export async function listTeamMessages(): Promise<TeamMessageItem[]> {
  const messages = await prisma.teamMessage.findMany({
    include: { author: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: MESSAGE_HISTORY_LIMIT,
  });

  return messages
    .map((message) => ({
      id: message.id,
      content: message.content,
      authorEmail: message.author.email,
      createdAt: message.createdAt.toISOString(),
    }))
    .reverse();
}

export async function postTeamMessage(authorId: string, content: string): Promise<void> {
  await prisma.teamMessage.create({ data: { authorId, content } });
}

export async function listTeamReminders(): Promise<TeamReminderItem[]> {
  const reminders = await prisma.teamReminder.findMany({
    include: { author: { select: { email: true } } },
    orderBy: [{ done: "asc" }, { createdAt: "desc" }],
  });

  return reminders.map((reminder) => ({
    id: reminder.id,
    content: reminder.content,
    done: reminder.done,
    authorEmail: reminder.author.email,
    createdAt: reminder.createdAt.toISOString(),
    doneAt: reminder.doneAt ? reminder.doneAt.toISOString() : null,
  }));
}

export async function createTeamReminder(authorId: string, content: string): Promise<void> {
  await prisma.teamReminder.create({ data: { authorId, content } });
}

export async function setTeamReminderDone(id: string, done: boolean): Promise<void> {
  await prisma.teamReminder.update({
    where: { id },
    data: { done, doneAt: done ? new Date() : null },
  });
}

/** Reuniões marcadas: leads no estágio "reuniao" com data de contato definida. */
export async function getUpcomingMeetings(): Promise<UpcomingMeetingItem[]> {
  const leads = await prisma.lead.findMany({
    where: { status: "reuniao", contactDate: { not: null } },
    include: { business: { select: { name: true } }, owner: { select: { email: true } } },
    orderBy: { contactDate: "asc" },
  });

  return leads.map((lead) => ({
    leadId: lead.id,
    businessName: lead.business.name,
    contactDate: lead.contactDate!.toISOString(),
    ownerEmail: lead.owner?.email ?? null,
  }));
}

function getReportRange(period: ReportPeriod, now: Date): { start: Date; end: Date } {
  const end = now;
  const start = new Date(now);
  if (period === "day") {
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(start.getDate() - 7);
  }
  return { start, end };
}

/**
 * Relatório automático do período (dia/semana) — sempre calculado ao
 * vivo por agregação direta no banco, nunca um valor estático ou
 * enviado por e-mail (não há infraestrutura de e-mail configurada).
 */
export async function getPeriodicReport(
  period: ReportPeriod,
  now: Date = new Date(),
): Promise<PeriodicReportData> {
  const { start, end } = getReportRange(period, now);

  const [businessesFound, leadsCreated, leadsWonAsClient, searchesRun] = await Promise.all([
    prisma.business.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.lead.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.lead.count({ where: { status: "cliente", updatedAt: { gte: start, lte: end } } }),
    prisma.search.count({ where: { createdAt: { gte: start, lte: end } } }),
  ]);

  return {
    period,
    rangeStart: start.toISOString(),
    rangeEnd: end.toISOString(),
    businessesFound,
    leadsCreated,
    leadsWonAsClient,
    searchesRun,
  };
}
