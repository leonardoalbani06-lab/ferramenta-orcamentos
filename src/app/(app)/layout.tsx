import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { getRepresentanteLogado } from "@/lib/session";
import { sairRepresentante } from "../actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const representante = await getRepresentanteLogado();
  if (!representante) redirect("/");

  return (
    <div className="min-h-screen bg-white pb-16 sm:pb-0">
      <header className="border-b border-brand-gold/20 bg-brand-oliveDark">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Image
                src="/brand/olivapel-mark-cream.png"
                alt="Olivapel"
                width={337}
                height={344}
                className="h-9 w-auto"
              />
            </div>
            <nav className="hidden gap-6 text-sm font-medium sm:flex">
              <Link href="/clientes" className="text-brand-cream/80 transition hover:text-brand-gold">
                Clientes
              </Link>
              <Link href="/catalogo" className="text-brand-cream/80 transition hover:text-brand-gold">
                Catálogo
              </Link>
              <Link href="/orcamentos" className="text-brand-cream/80 transition hover:text-brand-gold">
                Orçamentos
              </Link>
              {representante.role === "ADMIN" && (
                <Link
                  href="/admin/representantes"
                  className="text-brand-cream/80 transition hover:text-brand-gold"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Desktop: nome + trocar inline */}
          <div className="hidden items-center gap-4 sm:flex">
            <p className="text-sm text-brand-cream/60">{representante.nome}</p>
            <form action={sairRepresentante}>
              <button
                type="submit"
                className="rounded border border-brand-gold/40 px-3 py-1.5 text-xs font-medium text-brand-gold transition hover:bg-brand-gold/10"
              >
                Trocar
              </button>
            </form>
          </div>

          {/* Mobile: menu compacto (sem JS, via <details>) */}
          <details className="relative sm:hidden">
            <summary
              className="flex h-9 w-9 list-none items-center justify-center rounded-full border border-brand-gold/40 text-sm font-semibold text-brand-gold [&::-webkit-details-marker]:hidden"
            >
              {representante.nome.charAt(0).toUpperCase()}
            </summary>
            <div className="absolute right-0 top-11 z-50 w-52 rounded-lg border border-brand-gold/20 bg-brand-oliveDark p-3 shadow-xl">
              <p className="mb-2 truncate text-sm text-brand-cream">{representante.nome}</p>
              {representante.role === "ADMIN" && (
                <Link
                  href="/admin/representantes"
                  className="mb-2 block rounded border border-brand-gold/40 px-3 py-2 text-center text-xs font-medium text-brand-gold transition hover:bg-brand-gold/10"
                >
                  Admin
                </Link>
              )}
              <form action={sairRepresentante}>
                <button
                  type="submit"
                  className="w-full rounded border border-brand-gold/40 px-3 py-2 text-xs font-medium text-brand-gold transition hover:bg-brand-gold/10"
                >
                  Trocar representante
                </button>
              </form>
            </div>
          </details>
        </div>
      </header>

      {children}

      <BottomNav />
    </div>
  );
}
