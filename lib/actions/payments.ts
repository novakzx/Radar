"use server";

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStripeClient, ACCESS_PRICE_EUR_CENTS } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/site-url";
import { createPendingPayment, userHasPaidAccess } from "@/services/PaymentService";
import { requiresPayment } from "@/lib/payment-gate";
import { logAuditEvent } from "@/services/AuditLogService";

export type StartCheckoutState = { message: string } | undefined;

/**
 * Cria uma Stripe Checkout Session (hospedada pelo próprio Stripe) e
 * redireciona o usuário para lá. Nunca lidamos com dados de cartão no
 * nosso servidor (PCI SAQ-A) e o valor cobrado (€2, `ACCESS_PRICE_EUR_CENTS`)
 * é fixado aqui no servidor — o client não tem como alterá-lo.
 *
 * O acesso (`User.hasPaid`) só é concedido depois, pelo webhook
 * `/api/stripe/webhook`, quando o Stripe confirma que o pagamento foi
 * de fato aprovado. Este redirect de sucesso não concede nada por si só.
 */
export async function startCheckoutAction(): Promise<StartCheckoutState> {
  const session = await verifySession();

  const hasPaid = session.user.role === "admin" ? true : await userHasPaidAccess(session.user.id);
  if (!requiresPayment({ role: session.user.role, hasPaid })) {
    redirect("/dashboard");
  }

  const { allowed } = await checkRateLimit("checkout", session.user.id);
  if (!allowed) {
    return { message: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
  }

  const baseUrl = await getBaseUrl();
  const stripe = getStripeClient();

  let checkoutUrl: string;
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: ACCESS_PRICE_EUR_CENTS,
            product_data: {
              name: "AreaVon — Acesso aos painéis de prospecção",
              description: "Pagamento único. Libera Radar, CRM, Equipe e Dashboard.",
            },
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email ?? undefined,
      client_reference_id: session.user.id,
      metadata: { userId: session.user.id },
      success_url: `${baseUrl}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pagamento?cancelado=1`,
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe não retornou uma URL de checkout.");
    }

    await createPendingPayment({
      userId: session.user.id,
      stripeCheckoutSessionId: checkoutSession.id,
      amount: ACCESS_PRICE_EUR_CENTS,
      currency: "eur",
    });

    await logAuditEvent({
      userId: session.user.id,
      action: "payment.checkout_started",
      entity: "payment",
      entityId: checkoutSession.id,
    });

    checkoutUrl = checkoutSession.url;
  } catch (error) {
    console.error("[startCheckoutAction] falha ao criar sessão de checkout", error);
    return { message: "Não foi possível iniciar o pagamento agora. Tente novamente em instantes." };
  }

  redirect(checkoutUrl);
}
