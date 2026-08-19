"use client";

import { useMemo, useState } from "react";
import { criarOrcamento } from "../../../actions";
import { formatMoney } from "@/lib/format";
import { ProdutoThumb } from "@/components/ProdutoThumb";

type Cliente = { id: string; razaoSocial: string; cnpj: string };
type Produto = {
  codigo: string;
  descricao: string;
  categoria: string;
  unidade: string | null;
  precoTabelaA: number;
  precoTabelaB: number;
  ipiPercentual: number | null;
  imagemUrl: string | null;
};
type Tabela = "A" | "B";

function toCentavos(texto: string): number {
  const n = parseFloat(texto.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function OrcamentoBuilder({
  clientes,
  produtos,
  clienteIdInicial,
}: {
  clientes: Cliente[];
  produtos: Produto[];
  clienteIdInicial?: string;
}) {
  const [clienteId, setClienteId] = useState(clienteIdInicial ?? clientes[0]?.id ?? "");
  const [tabela, setTabela] = useState<Tabela>("A");
  const [categoria, setCategoria] = useState("");
  const [busca, setBusca] = useState("");
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [descontoPercentual, setDescontoPercentual] = useState("");
  const [freteValor, setFreteValor] = useState("");
  const [stValor, setStValor] = useState("");

  const categorias = useMemo(
    () => Array.from(new Set(produtos.map((p) => p.categoria))).sort(),
    [produtos]
  );

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      if (categoria && p.categoria !== categoria) return false;
      if (
        termo &&
        !p.descricao.toLowerCase().includes(termo) &&
        !p.codigo.toLowerCase().includes(termo)
      ) {
        return false;
      }
      return true;
    });
  }, [produtos, categoria, busca]);

  const itensSelecionados = useMemo(() => {
    return produtos
      .filter((p) => (quantidades[p.codigo] ?? 0) > 0)
      .map((p) => {
        const quantidade = quantidades[p.codigo];
        const valorUnitario = tabela === "A" ? p.precoTabelaA : p.precoTabelaB;
        const valorTotal = valorUnitario * quantidade;
        const ipi = Math.round((valorTotal * (p.ipiPercentual ?? 0)) / 100);
        return { codigo: p.codigo, quantidade, valorUnitario, valorTotal, ipi };
      });
  }, [produtos, quantidades, tabela]);

  const valorProdutos = itensSelecionados.reduce((acc, i) => acc + i.valorTotal, 0);
  const descontoValor = Math.round(
    (valorProdutos * (parseFloat(descontoPercentual.replace(",", ".")) || 0)) / 100
  );
  const ipiValor = itensSelecionados.reduce((acc, i) => acc + i.ipi, 0);
  const freteCent = toCentavos(freteValor);
  const stCent = toCentavos(stValor);
  const valorTotal = valorProdutos - descontoValor + ipiValor + freteCent + stCent;

  const itensJson = JSON.stringify(
    itensSelecionados.map((i) => ({ codigo: i.codigo, quantidade: i.quantidade }))
  );

  function setQuantidade(codigo: string, valor: string) {
    const n = Math.max(0, Math.trunc(Number(valor) || 0));
    setQuantidades((prev) => ({ ...prev, [codigo]: n }));
  }

  return (
    <form action={criarOrcamento} className="flex flex-col gap-8">
      <input type="hidden" name="itens" value={itensJson} />

      <section className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="clienteId">
            Cliente
          </label>
          <select
            id="clienteId"
            name="clienteId"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            className="rounded border border-gray-300 px-3 py-2 min-w-[16rem]"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.razaoSocial} — {c.cnpj}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Tabela de preço</label>
          <div className="flex gap-1">
            {(["A", "B"] as Tabela[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTabela(t)}
                className={`rounded px-4 py-2 text-sm ${
                  tabela === t
                    ? "bg-gray-900 text-white"
                    : "border border-gray-300 text-gray-700"
                }`}
              >
                Tabela {t}
              </button>
            ))}
          </div>
          <input type="hidden" name="tabela" value={tabela} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Produtos</h2>

        <div className="flex flex-wrap items-center gap-4 mb-3">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por descrição ou código"
            className="rounded border border-gray-300 px-3 py-2 text-sm w-64"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4 text-sm">
          <button
            type="button"
            onClick={() => setCategoria("")}
            className={`rounded px-3 py-1 ${
              !categoria ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"
            }`}
          >
            Todas
          </button>
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              className={`rounded px-3 py-1 ${
                categoria === c ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto max-h-[28rem] overflow-y-auto border border-gray-200 rounded">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="py-2 px-3"></th>
                <th className="py-2 px-3">SKU</th>
                <th className="py-2 px-3">Descrição</th>
                <th className="py-2 px-3">Unidade</th>
                <th className="py-2 px-3">Preço</th>
                <th className="py-2 px-3">Qtd.</th>
                <th className="py-2 px-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((p) => {
                const preco = tabela === "A" ? p.precoTabelaA : p.precoTabelaB;
                const qtd = quantidades[p.codigo] ?? 0;
                return (
                  <tr key={p.codigo} className="border-b border-gray-100">
                    <td className="py-2 px-3">
                      <ProdutoThumb imagemUrl={p.imagemUrl} descricao={p.descricao} size={32} />
                    </td>
                    <td className="py-2 px-3 text-gray-500">{p.codigo}</td>
                    <td className="py-2 px-3">{p.descricao}</td>
                    <td className="py-2 px-3 text-gray-600">{p.unidade ?? "—"}</td>
                    <td className="py-2 px-3">{formatMoney(preco)}</td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min={0}
                        value={qtd || ""}
                        onChange={(e) => setQuantidade(p.codigo, e.target.value)}
                        className="w-20 rounded border border-gray-300 px-2 py-1"
                      />
                    </td>
                    <td className="py-2 px-3 font-medium">
                      {qtd > 0 ? formatMoney(preco * qtd) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Outras informações</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Previsão de entrega" name="previsaoEntrega" />
          <Campo label="Ordem de compra" name="ordemCompra" />
          <Campo label="Frete por conta" name="fretePorConta" />
          <Campo label="Transportadora" name="transportadora" />
          <Campo label="Forma de pagamento" name="formaPagamento" />
          <Campo label="Condição de pagamento" name="condicaoPagamento" />
          <Campo label="Volumes" name="volumes" type="number" />
          <Campo label="Peso bruto (kg)" name="pesoBruto" type="number" />
          <Campo label="E-mail cópia do pedido" name="emailCopiaPedido" type="email" />
          <Campo label="E-mail XML NFe" name="emailXmlNfe" type="email" />
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="observacoes">
              Observação
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              rows={2}
              className="rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Valores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="descontoPercentual">
              Desconto (%)
            </label>
            <input
              id="descontoPercentual"
              name="descontoPercentual"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={descontoPercentual}
              onChange={(e) => setDescontoPercentual(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="freteValor">
              Frete (R$)
            </label>
            <input
              id="freteValor"
              name="freteValor"
              type="number"
              min={0}
              step="0.01"
              value={freteValor}
              onChange={(e) => setFreteValor(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="stValor">
              ST (R$)
            </label>
            <input
              id="stValor"
              name="stValor"
              type="number"
              min={0}
              step="0.01"
              value={stValor}
              onChange={(e) => setStValor(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="rounded border border-gray-200 p-4 max-w-sm ml-auto text-sm flex flex-col gap-1">
          <Linha label="Produtos" valor={formatMoney(valorProdutos)} />
          <Linha label="Desconto" valor={`- ${formatMoney(descontoValor)}`} />
          <Linha label="IPI" valor={`+ ${formatMoney(ipiValor)}`} />
          <Linha label="ST" valor={`+ ${formatMoney(stCent)}`} />
          <Linha label="Frete" valor={`+ ${formatMoney(freteCent)}`} />
          <div className="border-t border-gray-200 mt-2 pt-2">
            <Linha label="Total" valor={formatMoney(valorTotal)} destaque />
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!clienteId || itensSelecionados.length === 0}
          className="rounded bg-gray-900 px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-40"
        >
          Salvar orçamento
        </button>
        <a href="/orcamentos" className="rounded px-4 py-2 text-gray-600 hover:underline">
          Cancelar
        </a>
      </div>
    </form>
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

function Campo({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        className="rounded border border-gray-300 px-3 py-2"
      />
    </div>
  );
}
