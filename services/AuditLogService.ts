import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "auth.register"
  | "auth.login"
  | "auth.login_failed"
  | "auth.logout"
  | "lead.create"
  | "lead.update"
  | "lead.status_change"
  | "search.completed"
  | "leads.export"
  | "payment.checkout_started"
  | "payment.completed"
  | "payment.failed"
  | "ticket.create"
  | "ticket.claim"
  | "ticket.resolve";

/**
 * Registra uma ação relevante para auditoria. Nunca lança erro para o
 * chamador — uma falha ao gravar o log de auditoria não pode quebrar o
 * fluxo principal do usuário (ex.: impedir login). A falha real é
 * logada apenas no servidor.
 */
export async function logAuditEvent(input: {
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: input.metadata
          ? (input.metadata as Prisma.InputJsonValue)
          : undefined,
      },
    });
  } catch (error) {
    console.error("[AuditLogService] failed to record audit event", {
      action: input.action,
      entity: input.entity,
      error,
    });
  }
}
