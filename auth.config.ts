import type { NextAuthConfig } from "next-auth";

type AppRole = "admin" | "member";

/**
 * Configuração "edge-safe": sem Providers que dependam do Prisma/bcrypt.
 * Usada pelo Proxy (proxy.ts) para checagens otimistas de sessão (lê o
 * cookie/JWT, não consulta o banco). A configuração completa, com o
 * Credentials Provider, vive em auth.ts (runtime Node.js).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard");
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      if (isProtectedRoute && !isLoggedIn) {
        return false; // redireciona para pages.signIn
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      // `user` só vem preenchido no login (retorno do authorize()).
      // Usamos `token.sub` (nativo do JWT) como id e carregamos o
      // papel do usuário manualmente via um índice dinâmico, evitando
      // depender da mesclagem de tipos ambientes de `next-auth/jwt`.
      if (user) {
        const role = (user as { role?: AppRole }).role;
        if (role) token.role = role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      const role = token.role as AppRole | undefined;
      if (role) session.user.role = role;
      return session;
    },
  },
} satisfies NextAuthConfig;
