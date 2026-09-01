import { db } from "@/lib/db";
import { OrcamentosAdminList } from "./OrcamentosAdminList";

export default async function OrcamentosAdminPage() {
  const [orcamentos, representantes] = await Promise.all([
    db.orcamento.findMany({
      include: { cliente: { include: { representante: true } } },
      orderBy: { criadoEm: "desc" },
    }),
    db.representante.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-olive">Orçamentos</h1>
        <p className="text-sm text-gray-500">Orçamentos de todos os representantes.</p>
      </div>

      <OrcamentosAdminList orcamentos={orcamentos} representantes={representantes} />
    </main>
  );
}
