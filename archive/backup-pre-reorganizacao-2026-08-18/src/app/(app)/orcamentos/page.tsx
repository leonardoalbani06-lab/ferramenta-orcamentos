import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getRepresentanteId } from "@/lib/session";
import { formatDate, formatMoney } from "@/lib/format";

export default async function OrcamentosPage() {
  const representanteId = await getRepresentanteId();
  if (!representanteId) redirect("/");

  const orcamentos = await db.orcamento.findMany({
    where: { representanteId },
    include: { cliente: true },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Orçamentos</h1>
      </div>

      <Link
        href="/orcamentos/novo"
        className="inline-block mb-6 rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
      >
        + Novo orçamento
      </Link>

      {orcamentos.length === 0 ? (
        <p className="text-gray-600">Nenhum orçamento criado ainda.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orcamentos.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orcamentos/${o.id}`}
                className="block rounded border border-gray-200 p-4 hover:border-gray-400"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">Orçamento nº {o.id}</p>
                  <p className="font-medium">{formatMoney(o.valorTotal)}</p>
                </div>
                <p className="text-sm text-gray-600">{o.cliente.razaoSocial}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(o.data)} — Tabela {o.tabelaUsada}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
