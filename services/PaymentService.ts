import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Toda a lógica de acesso ao banco para pagamentos vive aqui — as rotas
 * (server action de checkout, webhook do Stripe, endpoint de status)
 * nunca tocam o Prisma diretamente, mesmo padrão de LeadService.
 *
 * Importante sobre segurança: nada aqui concede acesso (`hasPaid`) por
 * conta própria a partir de dados vindos do navegador. Quem concede
 * acesso é sempre `markPaymentAsPaid`, chamado exclusivamente pelo
 * handler do webhook do Stripe depois de validar a assinatura.
 */

export async function userHasPaidAccess(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hasPaid: true },
  });
  return user?.hasPaid ?? false;
}

export async function createPendingPayment(input: {
  userId: string;
  stripeCheckoutSessionId: string;
  amount: number;
  currency: string;
}) {
  return prisma.payment.create({
    data: {
      userId: input.userId,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId,
      amount: input.amount,
      currency: input.currency,
      status: "pending",
    },
  });
}

/**
 * Marca o pagamento como concluído e libera o acesso do usuário.
 * Único caminho no código inteiro que seta `hasPaid = true` — só deve
 * ser chamado pelo webhook do Stripe após verificação de assinatura.
 */
export async function markPaymentAsPaid(input: {
  stripeCheckoutSessionId: string;
  userId: string;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
}) {
  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { stripeCheckoutSessionId: input.stripeCheckoutSessionId },
      data: {
        status: "paid",
        stripePaymentIntentId: input.stripePaymentIntentId,
        paidAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: input.userId },
      data: {
        hasPaid: true,
        ...(input.stripeCustomerId ? { stripeCustomerId: input.stripeCustomerId } : {}),
      },
    }),
  ]);
}

export async function markPaymentAsFailed(stripeCheckoutSessionId: string) {
  await prisma.payment.updateMany({
    where: { stripeCheckoutSessionId },
    data: { status: "failed" },
  });
}

/** Idempotência: cada evento do Stripe só deve ser processado uma vez. */
export async function wasWebhookEventProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.stripeWebhookEvent.findUnique({ where: { id: eventId } });
  return existing !== null;
}

export async function recordWebhookEventProcessed(eventId: string, type: string) {
  await prisma.stripeWebhookEvent.create({ data: { id: eventId, type } });
}
