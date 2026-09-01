import type { DefaultSession } from "next-auth";

// Estende os tipos do NextAuth pra incluir os campos que a gente coloca
// no token/sessão em `auth.config.ts` (username, role) — sem isso o
// TypeScript não conhece `session.user.role`/`user.username` em lugar
// nenhum do app.
declare module "next-auth" {
  interface User {
    username: string;
    role: "ADMIN" | "REPRESENTANTE";
  }

  interface Session {
    user: {
      id: string;
      username: string;
      role: "ADMIN" | "REPRESENTANTE";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    role?: "ADMIN" | "REPRESENTANTE";
  }
}
