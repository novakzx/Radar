import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import {
  markPaymentAsFailed,
  markPaymentAsPaid,
  recordWebhookEventProcessed,
  wasWebhookEventProcessed,
} from "@/services/PaymentService";
import { logAuditEvent } from "@/services/AuditLogService";

// Precisa rodar em Node.js (não Edge): a verificação de assinatura do
// Stripe usa APIs de crypto do Node e o SDK não é edge-safe aqui.
export const runtime = "nodejs";

/**
 * Único lugar do sistema que pode liberar acesso pago (`User.hasPaid`).
 *
 * Defesas contra "burla do pagamento":
 * 1. Assinatura HMAC verificada com `STRIPE_WEBHOOK_SECRET` sobre o
 *    corpo bruto da requisição — só o Stripe (que conhece o segredo)
 *    consegue montar um evento que passe nessa checagem. Um evento
 *    forjado, ou reenviado com corpo alterado, é rejeitado com 400.
 * 2. Nunca confiamos no redirect do navegador (`success_url`) para
 *    liberar acesso — ele só mostra uma tela de "processando".
 * 3. Idempotência: cada `event.id` do Stripe só é processado uma vez
 *    (o Stripe reenvia eventos em caso de timeout/erro nosso).
 * 4. O `userId` vem do `metadata` que este servidor mesmo gravou ao
 *    criar a sessão de checkout — nunca de um campo editável pelo
 *    comprador.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET não configurada");
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe webhook] assinatura inválida — evento rejeitado", error);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    if (await wasWebhookEventProcessed(event.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const userId = checkoutSession.metadata?.userId ?? checkoutSession.client_reference_id;

        if (!userId) {
          console.error(
            "[stripe webhook] checkout.session.completed sem userId em metadata",
            checkoutSession.id,
          );
          break;
        }

        if (checkoutSession.payment_status !== "paid") {
          // Sessão concluída mas ainda não paga (ex.: método assíncrono
          // como boleto). Aguarda `checkout.session.async_payment_succeeded`.
          break;
        }

        const paymentIntentId =
          typeof checkoutSession.payment_intent === "string"
            ? checkoutSession.payment_intent
            : (checkoutSession.payment_intent?.id ?? null);
        const customerId =
          typeof checkoutSession.customer === "string" ? checkoutSession.customer : null;

        await markPaymentAsPaid({
          stripeCheckoutSessionId: checkoutSession.id,
          userId,
          stripePaymentIntentId: paymentIntentId,
          stripeCustomerId: customerId,
        });

        await logAuditEvent({
          userId,
          action: "payment.completed",
          entity: "payment",
          entityId: checkoutSession.id,
          metadata: {
            amountTotal: checkoutSession.amount_total,
            currency: checkoutSession.currency,
          },
        });
        break;
      }

      case "checkout.session.expired": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        await markPaymentAsFailed(checkoutSession.id);
        break;
      }

      default:
        // Eventos não tratados são ignorados silenciosamente (200), como
        // recomenda a documentação do Stripe.
        break;
    }

    await recordWebhookEventProcessed(event.id, event.type);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe webhook] falha ao processar evento", event.id, error);
    // 500 faz o Stripe reenviar o evento mais tarde (retry automático).
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
