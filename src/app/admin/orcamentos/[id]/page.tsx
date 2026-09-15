import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatDateIso, formatDecimal, formatMoney } from "@/lib/format";
import { ItensOrcamentoList } from "@/components/ItensOrcamentoList";
import { ReatribuirRepresentante } from "@/components/admin/ReatribuirRepresentante";
import { AcoesPdf } from "@/components/AcoesPdf";

export default async function OrcamentoAdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const orcamentoId = Number(id);
  if (!Number.isInteger(orcamentoId)) redirect("/admin/orcamentos");

  const [orcamento, representantes] = await Promise.all([
    db.orcamento.findFirst({
      where: { id: orcamentoId },
      include: {
        cliente: { include: { representante: true } },
        itens: { include: { produto: true } },
      },
    }),
    db.representante.findMany({ orderBy: { nome: "asc" } }),
  ]);
  if (!orcamento) redirect("/admin/orcamentos");

  const resumoTabelas = resumirTabelas(orcamento.itens.map((i) => i.tabelaUsada));

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold text-brand-olive">
          Orçamento nº {orcamento.id}
        </h1>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {!orcamento.pdfGeradoEm && (
              <Link
                href={`/admin/orcamentos/${orcamento.id}/editar`}
                className="rounded-lg border border-brand-olive px-4 py-2.5 text-center text-sm font-medium text-brand-olive transition hover:bg-brand-cream/40"
              >
                Editar
              </Link>
            )}
          </div>
          <AcoesPdf orcamentoId={orcamento.id} />
        </div>
      </div>
      <p className="mb-1 text-sm text-gray-500">
        {formatDate(orcamento.data)} — {resumoTabelas}
      </p>
      {orcamento.pdfGeradoEm && (
        <p className="mb-6 text-xs text-gray-400">
          🔒 PDF já gerado — este orçamento não pode mais ser editado.
        </p>
      )}

      <section className="mb-6">
        <h2 className="font-heading mb-2 text-lg font-bold text-brand-olive">Cliente</h2>
        <div className="rounded-lg border border-brand-cream p-4 text-sm">
          <p className="font-medium text-brand-olive">{orcamento.cliente.razaoSocial}</p>
          {orcamento.cliente.nomeFantasia && (
            <p className="text-gray-600">{orcamento.cliente.nomeFantasia}</p>
          )}
          <p className="text-gray-600">CNPJ: {orcamento.cliente.cnpj}</p>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-brand-cream pt-3">
            <p className="text-xs text-gray-500">Representante responsável por este cliente</p>
            <ReatribuirRepresentante
              clienteId={orcamento.cliente.id}
              representanteAtualId={orcamento.cliente.representanteId}
              representantes={representantes}
              paginaAtual={`/admin/orcamentos/${orcamento.id}`}
            />
          </div>
          {orcamento.cliente.representanteId !== orcamento.representanteId && (
            <p className="mt-2 text-xs text-gray-400">
              Este orçamento específico foi montado por outro representante — trocar aqui não
              altera orçamentos já criados, só o cadastro do cliente e os próximos orçamentos.
            </p>
          )}
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
          href={`/admin/clientes/${orcamento.clienteId}`}
          className="text-sm text-gray-500 hover:text-brand-olive hover:underline"
        >
          ← Voltar para o histórico do cliente
        </Link>
        <Link
          href="/admin/orcamentos"
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
