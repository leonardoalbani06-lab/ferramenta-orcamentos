import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getRepresentanteId } from "@/lib/session";
import { formatDate, formatDateIso, formatDecimal, formatMoney } from "@/lib/format";
import { ItensOrcamentoList } from "@/components/ItensOrcamentoList";

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

  const resumoTabelas = resumirTabelas(orcamento.itens.map((i) => i.tabelaUsada));

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold text-brand-olive">
          Orçamento nº {orcamento.id}
        </h1>
        
          href={`/orcamentos/${orcamento.id}/pdf`}
          className="rounded-lg bg-brand-olive px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-brand-oliveDark"
        >
          Baixar PDF
        </a>
      </div>
      <p className="mb-6 text-sm text-gray-500">
        {formatDate(orcamento.data)} — {resumoTabelas}
      </p>

      <section className="mb-6">
        <h2 className="font-heading mb-2 text-lg font-bold text-brand-olive">Cliente</h2>
        <div className="rounded-lg border border-brand-cream p-4 text-sm">
          <p className="font-medium text-brand-olive">{orcamento.cliente.razaoSocial}</p>
          {orcamento.cliente.nomeFantasia && (
            <p className="text-gray-600">{orcamento.cliente.nomeFantasia}</p>
          )}
          <p className="text-gray-600">CNPJ: {orcamento.cliente.cnpj}</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-heading mb-2 text-lg font-bold text-brand-olive">Itens</h2>
        <ItensOrcamentoList
          itens={orcamento.itens}
          podeEditarObservacao={!orcamento.pdfGeradoEm}
        />
      </section>

      <section className="mb-6">
        <h2 className="font-heading mb-2 text-lg font-bold text-brand-olive">Valores</h2>
        <div className="flex max-w-sm flex-col gap-1 rounded-lg border border-brand-cream p-4 text-sm">
          <Linha label="Produtos" valor={formatMoney(orcamento.valorProdutos)} />
          <Linha label="Desconto" valor={`- ${formatMoney(orcamento.descontoValor)}`} />
          <Linha label="IPI" valor={`+ ${formatMoney(orcamento.ipiValor)}`} />
          <Linha label="ST" valor={`+ ${formatMoney(orcamento.stValor)}`} />
          <Linha label="Frete" valor={`+ ${formatMoney(orcamento.freteValor)}`} />
          <div className="mt-2 border-t border-brand-cream pt-2">
            <Linha label="Total" valor={formatMoney(orcamento.valorTotal)} destaque />
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-heading mb-2 text-lg font-bold text-brand-olive">
          Outras informações
        </h2>
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-brand-cream p-4 text-sm sm:grid-cols-2">
          <Info label="Previsão de entrega" valor={formatDateIso(orcamento.previsaoEntrega) || null} />
          <Info label="Ordem de compra" valor={orcamento.ordemCompra} />
          <Info label="Frete por conta" valor={orcamento.fretePorConta} />
          <Info label="Transportadora" valor={orcamento.transportadora} />
          <Info label="Forma de pagamento" valor={orcamento.formaPagamento} />
          <Info label="Condição de pagamento" valor={orcamento.condicaoPagamento} />
          <Info label="Volumes" valor={orcamento.volumes?.toString() ?? null} />
          <Info
            label="Peso bruto (kg)"
            valor={orcamento.pesoBruto ? formatDecimal(orcamento.pesoBruto, 3) : null}
          />
          <Info label="E-mail cópia do pedido" valor={orcamento.emailCopiaPedido} />
          <Info label="E-mail XML NFe" valor={orcamento.emailXmlNfe} />
          {orcamento.observacoes && (
            <div className="sm:col-span-2">
              <Info label="Observação" valor={orcamento.observacoes} />
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Link
          href={`/clientes/${orcamento.clienteId}`}
          className="text-sm text-gray-500 hover:text-brand-olive hover:underline"
        >
          ← Voltar para o histórico do cliente
        </Link>
        <Link
          href="/orcamentos"
          className="text-sm text-gray-500 hover:text-brand-olive hover:underline"
        >
          ← Voltar para todos os orçamentos
        </Link>
      </div>
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
      <p className="text-xs text-gray-500">{label}</p>
      <p>{valor || "—"}</p>
    </div>
  );
}

function resumirTabelas(tabelas: string[]): string {
  const totalA = tabelas.filter((t) => t === "A").length;
  const totalB = tabelas.filter((t) => t === "B").length;
  if (totalA > 0 && totalB > 0) {
    return `${totalA} na Tabela A · ${totalB} na Tabela B`;
  }
  if (totalB > 0) return "Tabela B";
  return "Tabela A";
}
