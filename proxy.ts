import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next.js 16 renomeou Middleware para Proxy (mesma funcionalidade).
// Usa a config "edge-safe" (sem Prisma) para checagem otimista de sessão.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
