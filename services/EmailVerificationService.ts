import "server-only";
import { prisma } from "@/lib/prisma";
import { generateVerificationCode, hashVerificationCode, verifyVerificationCode } from "@/lib/verification-code";
import { sendVerificationEmail } from "@/lib/email";

const CODE_TTL_MINUTES = 15;

export async function isEmailVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } });
  return user?.emailVerified ?? false;
}

/** Gera um novo código, guarda o hash e envia por e-mail. */
export async function createAndSendVerificationCode(userId: string, email: string): Promise<void> {
  const code = generateVerificationCode();
  const codeHash = await hashVerificationCode(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60_000);

  await prisma.emailVerificationCode.create({
    data: { userId, codeHash, expiresAt },
  });

  const result = await sendVerificationEmail(email, code);
  if (!result.ok) {
    console.error(`[EmailVerificationService] falha ao enviar código de verificação para ${email}`);
  }
}

export type VerifyCodeResult = { ok: true } | { ok: false; error: string };

/** Confirma o código mais recente pendente do usuário. */
export async function verifyEmailCode(userId: string, code: string): Promise<VerifyCodeResult> {
  const pending = await prisma.emailVerificationCode.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!pending) {
    return { ok: false, error: "Nenhum código pendente. Peça um novo código." };
  }

  if (pending.expiresAt < new Date()) {
    return { ok: false, error: "Código expirado. Peça um novo código." };
  }

  const matches = await verifyVerificationCode(code, pending.codeHash);
  if (!matches) {
    return { ok: false, error: "Código incorreto." };
  }

  await prisma.$transaction([
    prisma.emailVerificationCode.update({ where: { id: pending.id }, data: { consumedAt: new Date() } }),
    prisma.user.update({ where: { id: userId }, data: { emailVerified: true } }),
  ]);

  return { ok: true };
}
