import Link from "next/link";
import { formatDate, formatMoney } from "@/lib/format";

// Lista simples de orçamentos de UM cliente só (já vem filtrada pelo
// chamador) — usada tanto no detalhe do cliente pro representante comum
// (`/clientes/[id]`, basePath "/orcamentos") quanto no cadastro do admin
// (`/admin/clientes/[id]`, basePath "/admin/orcamentos").
export function HistoricoOrcamentosCliente({
  orcamentos,
  basePath,
}: {
  orcamentos: { id: number; data: Date; valorTotal: number }[];
  basePath: string;
}) {
  if (orcamentos.length === 0) {
    return <p className="text-sm text-gray-500">Nenhum orçamento feito pra esse cliente ainda.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {orcamentos.map((o) => (
        <li key={o.id}>
          <Link
            href={`${basePath}/${o.id}`}
            className="flex items-center justify-between rounded-lg border border-brand-cream p-3 text-sm transition hover:border-brand-gold/40 hover:shadow-sm"
          >
            <span className="text-brand-olive">Orçamento nº {o.id}</span>
            <span className="text-gray-500">{formatDate(o.data)}</span>
            <span className="font-medium text-brand-olive">{formatMoney(o.valorTotal)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
