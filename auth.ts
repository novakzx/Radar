import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validation/auth";
import { logAuditEvent } from "@/services/AuditLogService";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          await logAuditEvent({
            action: "auth.login_failed",
            entity: "user",
            metadata: { email },
          });
          return null;
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          await logAuditEvent({
            userId: user.id,
            action: "auth.login_failed",
            entity: "user",
            entityId: user.id,
          });
          return null;
        }

        // Site fechado para uso pessoal: só a conta admin pode entrar.
        // Mensagem de erro genérica de propósito — não revela que a
        // senha estava certa mas o acesso foi negado por outro motivo.
        if (user.role !== "admin") {
          await logAuditEvent({
            userId: user.id,
            action: "auth.login_failed",
            entity: "user",
            entityId: user.id,
            metadata: { reason: "not_admin" },
          });
          return null;
        }

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      await logAuditEvent({
        userId: user.id,
        action: "auth.login",
        entity: "user",
        entityId: user.id,
      });
    },
    async signOut(message) {
      const userId =
        "token" in message ? (message.token?.sub ?? null) : null;
      await logAuditEvent({
        userId,
        action: "auth.logout",
        entity: "user",
        entityId: userId,
      });
    },
  },
});
