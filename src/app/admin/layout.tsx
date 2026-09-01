import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getRepresentanteLogado } from "@/lib/session";
import { sairRepresentante } from "../actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const representante = await getRepresentanteLogado();
  // O middleware já barra /admin pra quem não é ADMIN; isso aqui é só
  // uma segunda trava (ex: sessão expirou entre o middleware e o render).
  if (!representante || representante.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-brand-gold/20 bg-brand-oliveDark">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-8">
            <Image
              src="/brand/olivapel-mark-cream.png"
              alt="Olivapel"
              width={337}
              height={344}
              className="h-9 w-auto"
            />
            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/clientes" className="text-brand-cream/80 transition hover:text-brand-gold">
                Voltar pro app
              </Link>
              <span className="text-brand-gold">Representantes</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-brand-cream/60 sm:block">{representante.nome}</p>
            <form action={sairRepresentante}>
              <button
                type="submit"
                className="rounded border border-brand-gold/40 px-3 py-1.5 text-xs font-medium text-brand-gold transition hover:bg-brand-gold/10"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
