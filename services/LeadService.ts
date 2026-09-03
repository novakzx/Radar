import "server-only";
import type { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toBusinessListItem } from "@/services/BusinessService";
import { logAuditEvent } from "@/services/AuditLogService";
import { LEAD_STATUS_ORDER } from "@/types/lead";
import type { LeadBoardItem, LeadDetailItem } from "@/types/lead";

const leadWithBusinessInclude = {
  business: { include: { sources: true } },
  tags: true,
} satisfies Prisma.LeadInclude;

type LeadWithBusiness = Prisma.LeadGetPayload<{ include: typeof leadWithBusinessInclude }>;

function toLeadBoardItem(lead: LeadWithBusiness, ownerEmail: string | null): LeadBoardItem {
  return {
    id: lead.id,
    status: lead.status,
    potentialValue: lead.potentialValue,
    contactDate: lead.contactDate ? lead.contactDate.toISOString() : null,
    createdAt: lead.createdAt.toISOString(),
    business: toBusinessListItem(lead.business),
    tags: lead.tags.map((t) => t.tag),
    ownerEmail,
  };
}

export type CreateLeadResult =
  | { ok: true; leadId: string; alreadyExisted: boolean }
  | { ok: false; error: string };

/** Cria um lead a partir de um resultado de busca (empresa já persistida). */
export async function createLeadFromBusiness(
  businessId: string,
  ownerId: string,
): Promise<CreateLeadResult> {
  try {
    const existing = await prisma.lead.findFirst({ where: { businessId } });
    if (existing) {
      return { ok: true, leadId: existing.id, alreadyExisted: true };
    }

    const lead = await prisma.lead.create({
      data: { businessId, ownerId, status: "novo" },
    });

    await logAuditEvent({
      userId: ownerId,
      action: "lead.create",
      entity: "lead",
      entityId: lead.id,
      metadata: { businessId },
    });

    return { ok: true, leadId: lead.id, alreadyExisted: false };
  } catch (error) {
    console.error("[LeadService] createLeadFromBusiness falhou", error);
    return { ok: false, error: "Não foi possível salvar este lead agora. Tente novamente." };
  }
}

/** Todos os leads agrupados por estágio, prontos para o kanban. */
export async function listLeadsForBoard(): Promise<Record<LeadStatus, LeadBoardItem[]>> {
  const leads = await prisma.lead.findMany({
    include: { ...leadWithBusinessInclude, owner: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const board = Object.fromEntries(
    LEAD_STATUS_ORDER.map((status) => [status, [] as LeadBoardItem[]]),
  ) as Record<LeadStatus, LeadBoardItem[]>;

  for (const lead of leads) {
    board[lead.status].push(toLeadBoardItem(lead, lead.owner?.email ?? null));
  }

  return board;
}

export async function getLeadDetail(leadId: string): Promise<LeadDetailItem | null> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      ...leadWithBusinessInclude,
      owner: { select: { email: true } },
      notes: { include: { author: { select: { email: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!lead) return null;

  return {
    ...toLeadBoardItem(lead, lead.owner?.email ?? null),
    notes: lead.notes.map((note) => ({
      id: note.id,
      content: note.content,
      authorEmail: note.author.email,
      createdAt: note.createdAt.toISOString(),
    })),
  };
}

export type MoveLeadResult = { ok: true } | { ok: false; error: string };

/** Move um lead entre estágios do kanban (drag-and-drop) — persistido e auditado. */
export async function moveLeadStatus(
  leadId: string,
  status: LeadStatus,
  userId: string,
): Promise<MoveLeadResult> {
  try {
    const previous = await prisma.lead.findUnique({ where: { id: leadId }, select: { status: true } });
    if (!previous) {
      return { ok: false, error: "Lead não encontrado." };
    }

    await prisma.lead.update({ where: { id: leadId }, data: { status } });

    await logAuditEvent({
      userId,
      action: "lead.status_change",
      entity: "lead",
      entityId: leadId,
      metadata: { from: previous.status, to: status },
    });

    return { ok: true };
  } catch (error) {
    console.error("[LeadService] moveLeadStatus falhou", error);
    return { ok: false, error: "Não foi possível mover este lead agora. Tente novamente." };
  }
}

export async function addLeadNote(leadId: string, authorId: string, content: string) {
  const note = await prisma.leadNote.create({
    data: { leadId, authorId, content },
    include: { author: { select: { email: true } } },
  });

  await logAuditEvent({ userId: authorId, action: "lead.update", entity: "lead", entityId: leadId, metadata: { note: true } });

  return {
    id: note.id,
    content: note.content,
    authorEmail: note.author.email,
    createdAt: note.createdAt.toISOString(),
  };
}

export async function addLeadTag(leadId: string, tag: string) {
  const existing = await prisma.leadTag.findFirst({ where: { leadId, tag } });
  if (existing) return;
  await prisma.leadTag.create({ data: { leadId, tag } });
}

export async function removeLeadTag(leadId: string, tag: string) {
  await prisma.leadTag.deleteMany({ where: { leadId, tag } });
}

export async function updateLeadDetails(
  leadId: string,
  data: { potentialValue?: number | null; contactDate?: Date | null },
  userId: string,
) {
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      ...(data.potentialValue !== undefined ? { potentialValue: data.potentialValue } : {}),
      ...(data.contactDate !== undefined ? { contactDate: data.contactDate } : {}),
    },
  });

  await logAuditEvent({ userId, action: "lead.update", entity: "lead", entityId: leadId });
}

/** Mapa businessId -> leadId, para saber se um resultado de busca já virou lead. */
export async function getLeadIdsForBusinesses(
  businessIds: string[],
): Promise<Map<string, string>> {
  if (businessIds.length === 0) return new Map();
  const leads = await prisma.lead.findMany({
    where: { businessId: { in: businessIds } },
    select: { id: true, businessId: true },
  });
  return new Map(leads.map((lead) => [lead.businessId, lead.id]));
}

export async function getLeadsByIds(leadIds: string[]): Promise<LeadDetailItem[]> {
  if (leadIds.length === 0) return [];
  const leads = await prisma.lead.findMany({
    where: { id: { in: leadIds } },
    include: {
      ...leadWithBusinessInclude,
      owner: { select: { email: true } },
      notes: { include: { author: { select: { email: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  return leads.map((lead) => ({
    ...toLeadBoardItem(lead, lead.owner?.email ?? null),
    notes: lead.notes.map((note) => ({
      id: note.id,
      content: note.content,
      authorEmail: note.author.email,
      createdAt: note.createdAt.toISOString(),
    })),
  }));
}
