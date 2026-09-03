import "server-only";

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "AreaVon <onboarding@resend.dev>";

export interface SendEmailResult {
  ok: boolean;
}

/**
 * Envio de e-mail via API REST do Resend (sem instalar o SDK deles —
 * é uma chamada HTTP simples). Enquanto `RESEND_API_KEY` não estiver
 * configurada, apenas loga no servidor e retorna sucesso — mesmo
 * padrão de fallback gracioso usado para GOOGLE_PLACES_API_KEY/Upstash:
 * nunca bloqueia o cadastro por falta de uma infra opcional.
 */
async function sendEmail(input: { to: string; subject: string; html: string }): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY não configurada — e-mail "${input.subject}" para ${input.to} não foi enviado de verdade.`,
    );
    return { ok: true };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`[email] Resend respondeu ${response.status} ao enviar para ${input.to}: ${text}`);
      return { ok: false };
    }

    return { ok: true };
  } catch (error) {
    console.error("[email] falha de rede ao enviar e-mail", error);
    return { ok: false };
  }
}

export function sendVerificationEmail(to: string, code: string): Promise<SendEmailResult> {
  if (!process.env.RESEND_API_KEY) {
    // Log específico (com o código) só quando não há provedor
    // configurado — essencial pra testar o fluxo em dev sem depender
    // do Resend. Em produção, RESEND_API_KEY estará sempre setada.
    console.warn(`[email] código de verificação para ${to}: ${code}`);
  }

  return sendEmail({
    to,
    subject: "Seu código de verificação AreaVon",
    html: `
      <div style="font-family: -apple-system, sans-serif; background:#0e1012; color:#ffffff; padding:32px; border-radius:16px; max-width:420px; margin:0 auto;">
        <p style="letter-spacing:0.3em; text-transform:uppercase; font-size:12px; color:#8b96aa; margin:0 0 16px;">AreaVon</p>
        <h1 style="font-size:22px; margin:0 0 12px;">Confirme seu e-mail</h1>
        <p style="color:#a0aaba; font-size:14px; line-height:1.5; margin:0 0 20px;">
          Use o código abaixo para verificar sua conta. Ele expira em 15 minutos.
        </p>
        <p style="font-size:34px; font-weight:700; letter-spacing:0.25em; background:#15171b; padding:16px 20px; border-radius:12px; text-align:center; margin:0 0 20px;">
          ${code}
        </p>
        <p style="color:#566171; font-size:12px; margin:0;">
          Se você não pediu isso, pode ignorar este e-mail com segurança.
        </p>
      </div>
    `,
  });
}
