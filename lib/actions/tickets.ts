"use server";

import { revalidatePath } from "next/cache";
import { verifySession, requireRole } from "@/lib/dal";
import { checkRateLimit } from "@/lib/rate-limit";
import { ticketSchema, ticketReplySchema } from "@/lib/validation/ticket";
import * as TicketService from "@/services/TicketService";
import { logAuditEvent } from "@/services/AuditLogService";

export type CreateTicketState =
  | { errors?: Partial<Record<"subject" | "message", string[]>>; message?: string; ok?: boolean }
  | undefined;

export async function createTicketAction(
  _prevState: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  const session = await verifySession();

  const parsed = ticketSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { allowed } = await checkRateLimit("ticket_create", session.user.id);
  if (!allowed) {
    return { message: "Você atingiu o limite de tickets abertos por hora. Tente novamente mais tarde." };
  }

  const ticket = await TicketService.createTicket({ authorId: session.user.id, ...parsed.data });

  await logAuditEvent({
    userId: session.user.id,
    action: "ticket.create",
    entity: "ticket",
    entityId: ticket.id,
  });

  revalidatePath("/suporte");
  return { ok: true };
}

export type ReplyTicketState =
  | { errors?: Partial<Record<"content", string[]>>; message?: string; ok?: boolean }
  | undefined;

export async function replyTicketAction(
  ticketId: string,
  _prevState: ReplyTicketState,
  formData: FormData,
): Promise<ReplyTicketState> {
  const session = await verifySession();

  const parsed = ticketReplySchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const ticket = await TicketService.getTicketDetail(ticketId);
  if (!ticket) {
    return { message: "Ticket não encontrado." };
  }
  if (ticket.authorId !== session.user.id && session.user.role !== "admin") {
    return { message: "Você não tem permissão para responder este ticket." };
  }

  await TicketService.addTicketReply(ticketId, session.user.id, parsed.data.content);

  revalidatePath(`/suporte/${ticketId}`);
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
  return { ok: true };
}

export async function markTicketReadAction(ticketId: string) {
  await requireRole("admin");
  await TicketService.markTicketRead(ticketId);
  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${ticketId}`);
}

export async function claimTicketAction(ticketId: string) {
  const session = await requireRole("admin");
  await TicketService.claimTicket(ticketId, session.user.id);

  await logAuditEvent({
    userId: session.user.id,
    action: "ticket.claim",
    entity: "ticket",
    entityId: ticketId,
  });

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${ticketId}`);
}

export async function resolveTicketAction(ticketId: string) {
  const session = await requireRole("admin");
  await TicketService.resolveTicket(ticketId);

  await logAuditEvent({
    userId: session.user.id,
    action: "ticket.resolve",
    entity: "ticket",
    entityId: ticketId,
  });

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${ticketId}`);
}
