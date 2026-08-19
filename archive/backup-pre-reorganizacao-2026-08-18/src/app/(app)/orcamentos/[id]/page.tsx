import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getRepresentanteId } from "@/lib/session";
import { formatDate, formatMoney } from "@/lib/format";
import { ProdutoThumb } from "@/components/ProdutoThumb";

export default async function OrcamentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const representanteId = await getRepresentanteId();
  if (!representanteId) redirect("/");

  const orcamentoId = Number(id);
  if (!Number.isInteger(orcamentoId)) redirect("/orcamentos");

  const orcamento = await db.orcamento.findFirst({
    where: { id: orcamentoId, representanteId },
    include: { cliente: true, itens: { include: { produto: true } } },
  });
  if (!orcamento) redirect("/orcamentos");

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold">Orçamento nº {orcamento.id}</h1>
        <a
          href={`/orcamentos/${orcamento.id}/pdf`}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Baixar PDF
        </a>
      </div>
      <p className="text-gray-600 text-sm mb-6">
        {formatDate(orcamento.data)} — Tabela {orcamento.tabelaUsada}
      </p>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Cliente</h2>
        <div className="rounded border border-gray-200 p-4 text-sm">
          <p className="font-medium">{orcamento.cliente.razaoSocial}</p>
          {orcamento.cliente.nomeFantasia && (
            <p className="text-gray-600">{orcamento.cliente.nomeFantasia}</p>
          )}
          <p className="text-gray-600">CNPJ: {orcamento.cliente.cnpj}</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Itens</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="py-2 pr-4"></th>
                <th className="py-2 pr-4">SKU</th>
                <th className="py-2 pr-4">Descrição</th>
                <th className="py-2 pr-4">Qtd.</th>
                <th className="py-2 pr-4">Valor unit.</th>
                <th className="py-2 pr-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {orcamento.itens.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4">
                    <ProdutoThumb imagemUrl={item.produto.imagemUrl} descricao={item.descricao} size={36} />
                  </td>
                  <td className="py-2 pr-4 text-gray-500">{item.produtoCodigo}</td>
                  <td className="py-2 pr-4">{item.descricao}</td>
                  <td className="py-2 pr-4">{item.quantidade}</td>
                  <td className="py-2 pr-4">{formatMoney(item.valorUnitario)}</td>
                  <td className="py-2 pr-4 font-medium">{formatMoney(item.valorTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Valores</h2>
        <div className="rounded border border-gray-200 p-4 max-w-sm text-sm flex flex-col gap-1">
          <Linha label="Produtos" valor={formatMoney(orcamento.valorProdutos)} />
          <Linha label="Desconto" valor={`- ${formatMoney(orcamento.descontoValor)}`} />
          <Linha label="IPI" valor={`+ ${formatMoney(orcamento.ipiValor)}`} />
          <Linha label="ST" valor={`+ ${formatMoney(orcamento.stValor)}`} />
          <Linha label="Frete" valor={`+ ${formatMoney(orcamento.freteValor)}`} />
          <div className="border-t border-gray-200 mt-2 pt-2">
            <Linha label="Total" valor={formatMoney(orcamento.valorTotal)} destaque />
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Outras informações</h2>
        <div className="rounded border border-gray-200 p-4 text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Info label="Previsão de entrega" valor={orcamento.previsaoEntrega} />
          <Info label="Ordem de compra" valor={orcamento.ordemCompra} />
          <Info label="Frete por conta" valor={orcamento.fretePorConta} />
          <Info label="Transportadora" valor={orcamento.transportadora} />
          <Info label="Forma de pagamento" valor={orcamento.formaPagamento} />
          <Info label="Condição de pagamento" valor={orcamento.condicaoPagamento} />
          <Info label="Volumes" valor={orcamento.volumes?.toString() ?? null} />
          <Info label="Peso bruto (kg)" valor={orcamento.pesoBruto?.toString() ?? null} />
          <Info label="E-mail cópia do pedido" valor={orcamento.emailCopiaPedido} />
          <Info label="E-mail XML NFe" valor={orcamento.emailXmlNfe} />
          {orcamento.observacoes && (
            <div className="sm:col-span-2">
              <Info label="Observação" valor={orcamento.observacoes} />
            </div>
          )}
        </div>
      </section>

      <Link href="/orcamentos" className="text-sm text-gray-600 hover:underline">
        ← Voltar para orçamentos
      </Link>
    </main>
  );
}

function Linha({
  label,
  valor,
  destaque = false,
}: {
  label: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className={`flex justify-between ${destaque ? "font-semibold text-base" : ""}`}>
      <span className={destaque ? "" : "text-gray-600"}>{label}</span>
      <span>{valor}</span>
    </div>
  );
}

function Info({ label, valor }: { label: string; valor: string | null }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p>{valor || "—"}</p>
    </div>
  );
}
