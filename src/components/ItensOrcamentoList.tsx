"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { ProdutoThumb } from "@/components/ProdutoThumb";
import { ObservacaoModal } from "@/components/ObservacaoModal";
import { salvarObservacaoItem } from "@/app/actions";

type Item = {
  id: string;
  produtoCodigo: string;
  descricao: string;
  tabelaUsada: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  observacao: string | null;
  produto: { imagemUrl: string | null };
};

// Lista de itens de um orçamento já salvo — usada tanto na tela do
// representante (/orcamentos/[id]) quanto na do admin (/admin/orcamentos/[id]).
// Clicar num item abre a observação daquele item (ver ObservacaoModal). Só é
// possível editar enquanto o PDF do orçamento ainda não foi gerado —
// "podeEditarObservacao" reflete isso (vem de !orcamento.pdfGeradoEm).
export function ItensOrcamentoList({
  itens,
  podeEditarObservacao,
}: {
  itens: Item[];
  podeEditarObservacao: boolean;
}) {
  const [itemAbertoId, setItemAbertoId] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(itens.map((i) => [i.id, i.observacao]))
  );

  const itemAberto = itens.find((i) => i.id === itemAbertoId) ?? null;

  async function salvar(itemId: string, texto: string) {
    await salvarObservacaoItem(itemId, texto);
    setObservacoes((prev) => ({ ...prev, [itemId]: texto || null }));
  }

  return (
    <>
      {!podeEditarObservacao && (
        <p className="mb-2 text-xs text-gray-400">
          🔒 PDF já gerado — as observações dos itens não podem mais ser alteradas (mas dá pra
          ver clicando no item).
        </p>
      )}

      {/* Mobile: cards */}
      <ul className="flex flex-col gap-2 sm:hidden">
        {itens.map((item) => (
          <li
            key={item.id}
            onClick={() => setItemAbertoId(item.id)}
            role="button"
            tabIndex={0}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-brand-cream p-3 transition active:bg-brand-cream/20"
          >
            <ProdutoThumb imagemUrl={item.produto.imagemUrl} descricao={item.descricao} size={48} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-brand-olive">
                {item.descricao}
                {observacoes[item.id] && (
                  <span className="ml-1" title="Tem observação">
                    📝
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                SKU {item.produtoCodigo} · Tab. {item.tabelaUsada} · {item.quantidade} ×{" "}
                {formatMoney(item.valorUnitario)}
              </p>
            </div>
            <p className="shrink-0 font-medium text-brand-olive">{formatMoney(item.valorTotal)}</p>
          </li>
        ))}
      </ul>

      {/* Desktop: tabela */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-brand-cream text-left text-gray-500">
              <th className="py-2 pr-4"></th>
              <th className="py-2 pr-4">SKU</th>
              <th className="py-2 pr-4">Descrição</th>
              <th className="py-2 pr-4">Tab.</th>
              <th className="py-2 pr-4">Qtd.</th>
              <th className="py-2 pr-4">Valor unit.</th>
              <th className="py-2 pr-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr
                key={item.id}
                onClick={() => setItemAbertoId(item.id)}
                className="cursor-pointer border-b border-brand-cream/60 transition hover:bg-brand-cream/10"
              >
                <td className="py-2 pr-4">
                  <ProdutoThumb imagemUrl={item.produto.imagemUrl} descricao={item.descricao} size={36} />
                </td>
                <td className="py-2 pr-4 text-gray-500">{item.produtoCodigo}</td>
                <td className="py-2 pr-4">
                  {item.descricao}
                  {observacoes[item.id] && (
                    <span className="ml-1" title="Tem observação">
                      📝
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4 text-gray-600">{item.tabelaUsada}</td>
                <td className="py-2 pr-4">{item.quantidade}</td>
                <td className="py-2 pr-4">{formatMoney(item.valorUnitario)}</td>
                <td className="py-2 pr-4 font-medium">{formatMoney(item.valorTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {itemAberto && (
        <ObservacaoModal
          produtoDescricao={itemAberto.descricao}
          valorInicial={observacoes[itemAberto.id] ?? ""}
          somenteLeitura={!podeEditarObservacao}
          onSalvar={(texto) => salvar(itemAberto.id, texto)}
          onFechar={() => setItemAbertoId(null)}
        />
      )}
    </>
  );
}
