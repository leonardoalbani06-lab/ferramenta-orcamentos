import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuário" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!username || !password) return null;

        const representante = await db.representante.findUnique({ where: { username } });
        if (!representante || !representante.ativo) return null;

        const senhaValida = await bcrypt.compare(password, representante.passwordHash);
        if (!senhaValida) return null;

        await db.representante.update({
          where: { id: representante.id },
          data: { ultimoLoginEm: new Date() },
        });

        return {
          id: representante.id,
          name: representante.nome,
          username: representante.username,
          role: representante.role as "ADMIN" | "REPRESENTANTE",
        };
      },
    }),
  ],
});
