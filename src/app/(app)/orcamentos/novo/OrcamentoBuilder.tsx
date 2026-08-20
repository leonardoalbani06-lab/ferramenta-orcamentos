"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
  const [categoria, setCategoria] = useState("");
  const [busca, setBusca] = useState("");
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [tabelasPorProduto, setTabelasPorProduto] = useState<Record<string, Tabela>>({});
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
        const tabela = tabelasPorProduto[p.codigo] ?? "A";
        const valorUnitario = tabela === "A" ? p.precoTabelaA : p.precoTabelaB;
        const valorTotal = valorUnitario * quantidade;
        const ipi = Math.round((valorTotal * (p.ipiPercentual ?? 0)) / 100);
        return { codigo: p.codigo, quantidade, tabela, valorUnitario, valorTotal, ipi };
      });
  }, [produtos, quantidades, tabelasPorProduto]);

  const valorProdutos = itensSelecionados.reduce((acc, i) => acc + i.valorTotal, 0);
  const descontoValor = Math.round(
    (valorProdutos * (parseFloat(descontoPercentual.replace(",", ".")) || 0)) / 100
  );
  const ipiValor = itensSelecionados.reduce((acc, i) => acc + i.ipi, 0);
  const freteCent = toCentavos(freteValor);
  const stCent = toCentavos(stValor);
  const valorTotal = valorProdutos - descontoValor + ipiValor + freteCent + stCent;

  const itensJson = JSON.stringify(
    itensSelecionados.map((i) => ({ codigo: i.codigo, quantidade: i.quantidade, tabela: i.tabela }))
  );

  function setQuantidade(codigo: string, valor: string) {
    const n = Math.max(0, Math.trunc(Number(valor) || 0));
    setQuantidades((prev) => ({ ...prev, [codigo]: n }));
  }

  function ajustarQuantidade(codigo: string, delta: number) {
    setQuantidades((prev) => {
      const atual = prev[codigo] ?? 0;
      return { ...prev, [codigo]: Math.max(0, atual + delta) };
    });
  }

  function setTabelaProduto(codigo: string, tabela: Tabela) {
    setTabelasPorProduto((prev) => ({ ...prev, [codigo]: tabela }));
  }

  return (
    <form action={criarOrcamento} className="flex flex-col gap-8 pb-28 sm:pb-0">
      <input type="hidden" name="itens" value={itensJson} />

      <section className="flex flex-col gap-1">
        <label className="text-sm font-medium text-brand-olive" htmlFor="clienteId">
          Cliente
        </label>
        <select
          id="clienteId"
          name="clienteId"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          required
          className="rounded-lg border border-brand-olive/20 px-3 py-2.5 outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20 sm:min-w-[16rem]"
        >
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.razaoSocial} — {c.cnpj}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h2 className="font-heading mb-3 text-lg font-bold text-brand-olive">Produtos</h2>
        <p className="mb-3 text-xs text-gray-500">
          Cada item pode vir da Tabela A ou B — escolha por produto.
        </p>

        <div className="mb-3 flex flex-wrap items-center gap-4">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por descrição ou SKU"
            className="w-full rounded-lg border border-brand-olive/20 px-3 py-2.5 text-sm outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20 sm:w-64"
          />
        </div>

        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 text-sm sm:mx-0 sm:flex-wrap sm:px-0">
          <button
            type="button"
            onClick={() => setCategoria("")}
            className={`shrink-0 rounded-full px-3 py-1.5 ${
              !categoria
                ? "bg-brand-olive text-white"
                : "border border-brand-olive/20 text-brand-olive"
            }`}
          >
            Todas
          </button>
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              className={`shrink-0 rounded-full px-3 py-1.5 ${
                categoria === c
                  ? "bg-brand-olive text-white"
                  : "border border-brand-olive/20 text-brand-olive"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Mobile: cards */}
        <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pb-1 sm:hidden">
          {produtosFiltrados.map((p) => {
            const tabela = tabelasPorProduto[p.codigo] ?? "A";
            const preco = tabela === "A" ? p.precoTabelaA : p.precoTabelaB;
            const qtd = quantidades[p.codigo] ?? 0;
            return (
              <li
                key={p.codigo}
                className={`rounded-xl border p-3 ${
                  qtd > 0 ? "border-brand-gold bg-brand-limeLight/30" : "border-brand-cream bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ProdutoThumb imagemUrl={p.imagemUrl} descricao={p.descricao} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-olive">{p.descricao}</p>
                    <p className="text-xs text-gray-500">
                      SKU {p.codigo} · {formatMoney(preco)}
                    </p>
                  </div>
                  <TabelaToggle
                    valor={tabela}
                    onChange={(t) => setTabelaProduto(p.codigo, t)}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-brand-olive">
                    {qtd > 0 ? formatMoney(preco * qtd) : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => ajustarQuantidade(p.codigo, -1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-olive/20 text-lg leading-none text-brand-olive"
                      aria-label="Diminuir quantidade"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={qtd || ""}
                      onChange={(e) => setQuantidade(p.codigo, e.target.value)}
                      className="w-14 rounded-lg border border-brand-olive/20 px-2 py-2 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => ajustarQuantidade(p.codigo, 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-olive/20 text-lg leading-none text-brand-olive"
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Desktop: tabela */}
        <div className="hidden max-h-[28rem] overflow-x-auto overflow-y-auto rounded border border-brand-cream sm:block">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-brand-cream text-left text-gray-500">
                <th className="py-2 px-3"></th>
                <th className="py-2 px-3">SKU</th>
                <th className="py-2 px-3">Descrição</th>
                <th className="py-2 px-3">Unidade</th>
                <th className="py-2 px-3">Tabela</th>
                <th className="py-2 px-3">Preço</th>
                <th className="py-2 px-3">Qtd.</th>
                <th className="py-2 px-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((p) => {
                const tabela = tabelasPorProduto[p.codigo] ?? "A";
                const preco = tabela === "A" ? p.precoTabelaA : p.precoTabelaB;
                const qtd = quantidades[p.codigo] ?? 0;
                return (
                  <tr key={p.codigo} className="border-b border-brand-cream/60">
                    <td className="py-2 px-3">
                      <ProdutoThumb imagemUrl={p.imagemUrl} descricao={p.descricao} size={32} />
                    </td>
                    <td className="py-2 px-3 text-gray-500">{p.codigo}</td>
                    <td className="py-2 px-3">{p.descricao}</td>
                    <td className="py-2 px-3 text-gray-600">{p.unidade ?? "—"}</td>
                    <td className="py-2 px-3">
                      <TabelaToggle
                        valor={tabela}
                        onChange={(t) => setTabelaProduto(p.codigo, t)}
                      />
                    </td>
                    <td className="py-2 px-3">{formatMoney(preco)}</td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min={0}
                        value={qtd || ""}
                        onChange={(e) => setQuantidade(p.codigo, e.target.value)}
                        className="w-20 rounded border border-brand-olive/20 px-2 py-1"
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
        <h2 className="font-heading mb-3 text-lg font-bold text-brand-olive">
          Outras informações
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium text-brand-olive" htmlFor="observacoes">
              Observação
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              rows={2}
              className="rounded-lg border border-brand-olive/20 px-3 py-2.5 outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-heading mb-3 text-lg font-bold text-brand-olive">Valores</h2>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-olive" htmlFor="descontoPercentual">
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
              className="rounded-lg border border-brand-olive/20 px-3 py-2.5 outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-olive" htmlFor="freteValor">
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
              className="rounded-lg border border-brand-olive/20 px-3 py-2.5 outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-olive" htmlFor="stValor">
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
              className="rounded-lg border border-brand-olive/20 px-3 py-2.5 outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
            />
          </div>
        </div>

        <div className="ml-auto flex max-w-sm flex-col gap-1 rounded-lg border border-brand-cream p-4 text-sm">
          <Linha label="Produtos" valor={formatMoney(valorProdutos)} />
          <Linha label="Desconto" valor={`- ${formatMoney(descontoValor)}`} />
          <Linha label="IPI" valor={`+ ${formatMoney(ipiValor)}`} />
          <Linha label="ST" valor={`+ ${formatMoney(stCent)}`} />
          <Linha label="Frete" valor={`+ ${formatMoney(freteCent)}`} />
          <div className="mt-2 border-t border-brand-cream pt-2">
            <Linha label="Total" valor={formatMoney(valorTotal)} destaque />
          </div>
        </div>
      </section>

      {/* Desktop: ações inline */}
      <div className="hidden gap-3 sm:flex">
        <button
          type="submit"
          disabled={!clienteId || itensSelecionados.length === 0}
          className="rounded-lg bg-brand-olive px-6 py-2.5 font-medium text-white transition hover:bg-brand-oliveDark disabled:opacity-40"
        >
          Salvar orçamento
        </button>
        <Link
          href="/orcamentos"
          className="rounded-lg px-4 py-2.5 text-gray-600 transition hover:text-brand-olive hover:underline"
        >
          Cancelar
        </Link>
      </div>

      {/* Mobile: barra de ação fixa, acima do BottomNav */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-brand-gold/20 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">
              {itensSelecionados.length} {itensSelecionados.length === 1 ? "item" : "itens"}
            </p>
            <p className="text-lg font-semibold text-brand-olive">{formatMoney(valorTotal)}</p>
          </div>
          <button
            type="submit"
            disabled={!clienteId || itensSelecionados.length === 0}
            className="rounded-lg bg-brand-olive px-6 py-3 font-medium text-white disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
      </div>
    </form>
  );
}

function TabelaToggle({
  valor,
  onChange,
}: {
  valor: Tabela;
  onChange: (t: Tabela) => void;
}) {
  return (
    <div className="flex shrink-0 overflow-hidden rounded-md border border-brand-olive/20 text-xs font-medium">
      {(["A", "B"] as Tabela[]).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`w-6 py-1 ${
            valor === t ? "bg-brand-olive text-white" : "text-brand-olive"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
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
      <label htmlFor={name} className="text-sm font-medium text-brand-olive">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        className="rounded-lg border border-brand-olive/20 px-3 py-2.5 outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
      />
    </div>
  );
}
