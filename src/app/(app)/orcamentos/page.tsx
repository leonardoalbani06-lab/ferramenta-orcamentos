import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getRepresentanteId } from "@/lib/session";
import { OrcamentosList } from "./OrcamentosList";

export default async function OrcamentosPage() {
  const representanteId = await getRepresentanteId();
  if (!representanteId) redirect("/");

  const orcamentos = await db.orcamento.findMany({
    where: { representanteId },
    include: { cliente: true },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-brand-olive">Orçamentos</h1>
      </div>

      <Link
        href="/orcamentos/novo"
        className="mb-6 inline-block rounded-lg bg-brand-olive px-4 py-2.5 font-medium text-white transition hover:bg-brand-oliveDark"
      >
        + Novo orçamento
      </Link>

      <OrcamentosList orcamentos={orcamentos} />
    </main>
  );
}
