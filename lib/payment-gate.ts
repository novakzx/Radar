/**
 * Regra determinística de acesso pago — extraída como função pura
 * (sem tocar banco/sessão) para ser testável e para que o layout do
 * dashboard e a página de pagamento nunca divirjam sobre quem precisa
 * pagar.
 */
export function requiresPayment(user: { role: "admin" | "member"; hasPaid: boolean }): boolean {
  return user.role !== "admin" && !user.hasPaid;
}
