import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { OrcamentoBuilder } from "@/app/(app)/orcamentos/novo/OrcamentoBuilder";

export default async function EditarOrcamentoAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;

  const orcamentoId = Number(id);
  if (!Number.isInteger(orcamentoId)) redirect("/admin/orcamentos");

  const orcamento = await db.orcamento.findFirst({
    where: { id: orcamentoId },
    include: { itens: true },
  });
  if (!orcamento) redirect("/admin/orcamentos");

  // Trava: não dá pra editar depois que o PDF já foi gerado (mesma regra
  // da observação por item, ver actions.ts).
  if (orcamento.pdfGeradoEm) {
    redirect(
      `/admin/orcamentos/${orcamentoId}?erro=` +
        encodeURIComponent("Esse orçamento já teve o PDF gerado e não pode mais ser editado.")
    );
  }

  // Clientes do representante DONO do orçamento — não do admin (admin não
  // tem carteira própria de clientes).
  const [clientes, produtos] = await Promise.all([
    db.cliente.findMany({
      where: { representanteId: orcamento.representanteId },
      orderBy: { razaoSocial: "asc" },
      select: { id: true, razaoSocial: true, cnpj: true },
    }),
    db.produto.findMany({
      where: { ativo: true },
      orderBy: [{ categoria: "asc" }, { descricao: "asc" }],
      select: {
        codigo: true,
        descricao: true,
        categoria: true,
        unidade: true,
        precoTabelaA: true,
        precoTabelaB: true,
        ipiPercentual: true,
        imagemUrl: true,
        peso: true,
      },
    }),
  ]);

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <h1 className="font-heading mb-6 text-2xl font-bold text-brand-olive">
        Editar orçamento nº {orcamento.id}
      </h1>

      {erro && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}

      <OrcamentoBuilder
        clientes={clientes}
        produtos={produtos}
        clienteIdInicial={orcamento.clienteId}
        orcamentoIdParaEditar={orcamento.id}
        itensIniciais={orcamento.itens.map((i) => ({
          codigo: i.produtoCodigo,
          quantidade: i.quantidade,
          tabela: i.tabelaUsada === "B" ? "B" : "A",
          observacao: i.observacao,
        }))}
        valoresIniciais={{
          previsaoEntrega: orcamento.previsaoEntrega,
          ordemCompra: orcamento.ordemCompra,
          fretePorConta: orcamento.fretePorConta,
          transportadora: orcamento.transportadora,
          formaPagamento: orcamento.formaPagamento,
          condicaoPagamento: orcamento.condicaoPagamento,
          emailCopiaPedido: orcamento.emailCopiaPedido,
          emailXmlNfe: orcamento.emailXmlNfe,
          observacoes: orcamento.observacoes,
          descontoPercentual: orcamento.descontoPercentual,
          freteValor: orcamento.freteValor,
          stValor: orcamento.stValor,
        }}
      />
    </main>
  );
}
