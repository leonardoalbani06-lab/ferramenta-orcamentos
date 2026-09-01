import type { NextAuthConfig } from "next-auth";

// Config "edge-safe": usada pelo middleware (roda no Edge Runtime) e pela
// config completa em `auth.ts`. Não pode importar nada que dependa do
// Prisma Client/bcrypt aqui — só o suficiente pra decodificar o JWT da
// sessão e definir os callbacks que enriquecem token/session.
export const authConfig = {
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  providers: [], // provider de credenciais (com Prisma) é adicionado em auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.username = token.username as string;
        session.user.role = token.role as "ADMIN" | "REPRESENTANTE";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
