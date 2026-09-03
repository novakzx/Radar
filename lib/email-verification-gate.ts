/**
 * Regra determinística de verificação de e-mail — mesma abordagem de
 * lib/payment-gate.ts: função pura, testável, usada em todos os pontos
 * que precisam decidir se um usuário precisa confirmar o e-mail.
 */
export function requiresEmailVerification(user: { role: "admin" | "member"; emailVerified: boolean }): boolean {
  return user.role !== "admin" && !user.emailVerified;
}
