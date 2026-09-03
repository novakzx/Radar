import "server-only";
import crypto from "node:crypto";
import { hashPassword, verifyPassword } from "@/lib/password";

/** Código numérico de 6 dígitos, sempre com zero à esquerda. */
export function generateVerificationCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

// Reaproveita o mesmo hash (bcrypt, custo 12) usado para senhas — o
// código é um segredo de curta duração, mas nunca fica em texto puro
// no banco mesmo assim.
export const hashVerificationCode = hashPassword;
export const verifyVerificationCode = verifyPassword;
