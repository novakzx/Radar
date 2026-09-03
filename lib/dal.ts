import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Data Access Layer — checagem "segura" de sessão (via Auth.js/JWT
 * assinado), a ser usada em Server Components, Server Actions e Route
 * Handlers antes de qualquer leitura/escrita sensível. `cache()` evita
 * decodificar a sessão mais de uma vez por render.
 */
export const verifySession = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
});

export const getOptionalSession = cache(async () => {
  return auth();
});

export async function requireRole(role: "admin" | "member") {
  const session = await verifySession();
  if (session.user.role !== role && !(role === "member" && session.user.role === "admin")) {
    redirect("/dashboard");
  }
  return session;
}
