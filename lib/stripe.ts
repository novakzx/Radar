import "server-only";
import Stripe from "stripe";

let cachedClient: Stripe | null = null;

/**
 * Cliente Stripe (server-only — a chave secreta nunca pode chegar ao
 * client). Instanciado uma única vez por processo/lambda.
 */
export function getStripeClient(): Stripe {
  if (cachedClient) return cachedClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY não configurada. Defina a variável de ambiente antes de usar pagamentos.",
    );
  }

  cachedClient = new Stripe(secretKey, {
    // Usa a versão de API padrão do SDK instalado — evita divergência
    // entre o literal fixado aqui e a versão que o pacote realmente fala.
    typescript: true,
  });
  return cachedClient;
}

/** Valor único e fixo do acesso aos painéis — nunca aceito do client. */
export const ACCESS_PRICE_EUR_CENTS = 200;
