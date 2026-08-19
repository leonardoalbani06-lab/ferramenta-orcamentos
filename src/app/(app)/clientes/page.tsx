import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getRepresentanteId } from "@/lib/session";
import { ClientesList } from "./ClientesList";

export default async function ClientesPage() {
  const representanteId = await getRepresentanteId();
  if (!representanteId) redirect("/");

  const clientes = await db.cliente.findMany({
    where: { representanteId },
    orderBy: { razaoSocial: "asc" },
  });

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-brand-olive">Clientes</h1>
        <Link
          href="/clientes/novo"
          className="shrink-0 rounded-lg bg-brand-olive px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-oliveDark"
        >
          + Novo cliente
        </Link>
      </div>

      <ClientesList clientes={clientes} />
    </main>
  );
}
