import type { DefaultSession } from "next-auth";

type AppRole = "admin" | "member";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: AppRole;
  }
}

// Nota: não aumentamos `next-auth/jwt` aqui — o campo customizado `role`
// no JWT é lido/escrito com um cast pontual em auth.config.ts, pois a
// mesclagem de tipos ambientes para o módulo `JWT` reexportado não se
// aplica de forma confiável nesta versão do next-auth/TypeScript.
