import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const representanteId = request.cookies.get("representanteId")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/" && representanteId) {
    return NextResponse.redirect(new URL("/clientes", request.url));
  }
  if (
    (pathname.startsWith("/clientes") ||
      pathname.startsWith("/catalogo") ||
      pathname.startsWith("/orcamentos")) &&
    !representanteId
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/clientes/:path*", "/catalogo/:path*", "/orcamentos/:path*"],
};
