import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Instância separada da config completa (`auth.ts`) porque o middleware
// roda no Edge Runtime — não pode carregar Prisma/bcrypt, só precisa
// decodificar o JWT da sessão pra saber se tem login válido e qual o role.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const logado = !!req.auth;
  const role = req.auth?.user?.role;

  if (pathname === "/" && logado) {
    return NextResponse.redirect(new URL("/clientes", req.url));
  }

  if (
    (pathname.startsWith("/clientes") ||
      pathname.startsWith("/catalogo") ||
      pathname.startsWith("/orcamentos")) &&
    !logado
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL(logado ? "/clientes" : "/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/clientes/:path*",
    "/catalogo/:path*",
    "/orcamentos/:path*",
    "/admin/:path*",
  ],
};
