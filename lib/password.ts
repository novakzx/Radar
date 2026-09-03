import "server-only";
import bcrypt from "bcryptjs";

// Custo >= 12 conforme exigido pelas restrições de segurança do produto.
const BCRYPT_COST = 12;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_COST);
}

export async function verifyPassword(
  plainText: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
