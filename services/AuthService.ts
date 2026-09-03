import "server-only";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { logAuditEvent } from "@/services/AuditLogService";

export type RegisterResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

/**
 * Cria uma nova conta de usuário (papel padrão: member).
 * Mensagens de erro são sempre amigáveis — nenhum detalhe técnico
 * (stack trace, erro do driver do banco) chega ao chamador.
 */
export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos. Verifique o e-mail e a senha informados." };
  }

  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Já existe uma conta com este e-mail." };
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, role: "member" },
      select: { id: true },
    });

    await logAuditEvent({
      userId: user.id,
      action: "auth.register",
      entity: "user",
      entityId: user.id,
    });

    return { ok: true, userId: user.id };
  } catch (error) {
    console.error("[AuthService] registerUser failed", error);
    return {
      ok: false,
      error: "Não foi possível criar sua conta agora. Tente novamente em alguns instantes.",
    };
  }
}
