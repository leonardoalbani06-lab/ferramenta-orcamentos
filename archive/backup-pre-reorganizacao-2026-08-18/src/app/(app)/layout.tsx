import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLeaf } from "@/components/BrandLeaf";
import { db } from "@/lib/db";
import { getRepresentanteId } from "@/lib/session";
import { sairRepresentante } from "../actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const representanteId = await getRepresentanteId();
  if (!representanteId) redirect("/");

  const representante = await db.representante.findUnique({
    where: { id: representanteId },
  });
  if (!representante) redirect("/");

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-brand-gold/20 bg-brand-oliveDark">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <BrandLeaf className="h-6 w-6 text-brand-gold" />
              <span className="font-heading text-lg font-bold text-brand-cream">
                D&apos;Classe
              </span>
            </div>
            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/clientes" className="text-brand-cream/80 transition hover:text-brand-gold">
                Clientes
              </Link>
              <Link href="/catalogo" className="text-brand-cream/80 transition hover:text-brand-gold">
                Catálogo
              </Link>
              <Link href="/orcamentos" className="text-brand-cream/80 transition hover:text-brand-gold">
                Orçamentos
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
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
        </div>
      </header>
      {children}
    </div>
  );
}
