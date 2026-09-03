"use server";

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAndSendVerificationCode, verifyEmailCode } from "@/services/EmailVerificationService";
import { logAuditEvent } from "@/services/AuditLogService";

export type VerifyEmailState = { message?: string } | undefined;

export async function verifyEmailCodeAction(
  _prevState: VerifyEmailState,
  formData: FormData,
): Promise<VerifyEmailState> {
  const session = await verifySession();
  const code = String(formData.get("code") ?? "").trim();

  if (!/^\d{6}$/.test(code)) {
    return { message: "Digite os 6 dígitos do código." };
  }

  const { allowed } = await checkRateLimit("email_verify", session.user.id);
  if (!allowed) {
    return { message: "Muitas tentativas. Aguarde alguns minutos e tente de novo." };
  }

  const result = await verifyEmailCode(session.user.id, code);
  if (!result.ok) {
    return { message: result.error };
  }

  await logAuditEvent({
    userId: session.user.id,
    action: "auth.email_verified",
    entity: "user",
    entityId: session.user.id,
  });

  redirect("/dashboard");
}

export type ResendCodeState = { message: string } | undefined;

export async function resendVerificationCodeAction(): Promise<ResendCodeState> {
  const session = await verifySession();

  const { allowed } = await checkRateLimit("email_verify_resend", session.user.id);
  if (!allowed) {
    return { message: "Você já pediu um código recentemente. Aguarde um pouco e tente de novo." };
  }

  await createAndSendVerificationCode(session.user.id, session.user.email ?? "");
  return { message: "Novo código enviado para o seu e-mail." };
}
