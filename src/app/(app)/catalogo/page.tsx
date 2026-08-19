import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { ProdutoThumb } from "@/components/ProdutoThumb";

type Tabela = "A" | "B";

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; busca?: string; tabela?: string }>;
}) {
  const params = await searchParams;
  const categoria = params.categoria ?? "";
  const busca = params.busca ?? "";
  const tabela: Tabela = params.tabela === "B" ? "B" : "A";

  const produtos = await db.produto.findMany({
    where: { ativo: true },
    orderBy: [{ categoria: "asc" }, { descricao: "asc" }],
  });

  const categorias = Array.from(new Set(produtos.map((p) => p.categoria))).sort();

  const termo = busca.trim().toLowerCase();
  const produtosFiltrados = produtos.filter((p) => {
    if (categoria && p.categoria !== categoria) return false;
    if (termo && !p.descricao.toLowerCase().includes(termo) && !p.codigo.toLowerCase().includes(termo)) {
      return false;
    }
    return true;
  });

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-8">
      <h1 className="font-heading mb-6 text-2xl font-bold text-brand-olive">Catálogo</h1>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <form method="get" className="flex gap-2">
          <input type="hidden" name="categoria" value={categoria} />
          <input type="hidden" name="tabela" value={tabela} />
          <input
            type="text"
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por descrição ou SKU"
            className="min-w-0 flex-1 rounded-lg border border-brand-olive/20 px-3 py-2.5 text-sm outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20 sm:w-64 sm:flex-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-brand-olive px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-oliveDark"
          >
            Buscar
          </button>
        </form>

        <div className="grid grid-cols-2 gap-1 text-sm sm:flex">
          {(["A", "B"] as Tabela[]).map((t) => (
            <a
              key={t}
              href={buildQuery({ categoria, busca, tabela: t })}
              className={`rounded-lg px-3 py-2.5 text-center font-medium sm:py-2 ${
                tabela === t
                  ? "bg-brand-olive text-white"
                  : "border border-brand-olive/20 text-brand-olive"
              }`}
            >
              Tabela {t}
            </a>
          ))}
        </div>
      </div>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 text-sm sm:mx-0 sm:flex-wrap sm:px-0">
        <a
          href={buildQuery({ categoria: undefined, busca, tabela })}
          className={`shrink-0 rounded-full px-3 py-1.5 ${
            !categoria
              ? "bg-brand-olive text-white"
              : "border border-brand-olive/20 text-brand-olive"
          }`}
        >
          Todas
        </a>
        {categorias.map((c) => (
          <a
            key={c}
            href={buildQuery({ categoria: c, busca, tabela })}
            className={`shrink-0 rounded-full px-3 py-1.5 ${
              categoria === c
                ? "bg-brand-olive text-white"
                : "border border-brand-olive/20 text-brand-olive"
            }`}
          >
            {c}
          </a>
        ))}
      </div>

      {produtosFiltrados.length === 0 ? (
        <p className="text-gray-500">Nenhum produto encontrado.</p>
      ) : (
        <>
          {/* Mobile: cards */}
          <ul className="flex flex-col gap-3 sm:hidden">
            {produtosFiltrados.map((p) => (
              <li
                key={p.codigo}
                className="flex items-center gap-3 rounded-xl border border-brand-cream bg-white p-3"
              >
                <ProdutoThumb imagemUrl={p.imagemUrl} descricao={p.descricao} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-olive">{p.descricao}</p>
                  <p className="text-xs text-gray-500">
                    SKU {p.codigo}
                    {p.unidade ? ` · ${p.unidade}` : ""}
                  </p>
                </div>
                <p className="shrink-0 font-medium text-brand-olive">
                  {formatMoney(tabela === "A" ? p.precoTabelaA : p.precoTabelaB)}
                </p>
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
                  {!categoria && <th className="py-2 pr-4">Categoria</th>}
                  <th className="py-2 pr-4">Unidade</th>
                  <th className="py-2 pr-4">Preço</th>
                  <th className="py-2 pr-4">IPI</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((p) => (
                  <tr key={p.codigo} className="border-b border-brand-cream/60">
                    <td className="py-2 pr-4">
                      <ProdutoThumb imagemUrl={p.imagemUrl} descricao={p.descricao} size={36} />
                    </td>
                    <td className="py-2 pr-4 text-gray-500">{p.codigo}</td>
                    <td className="py-2 pr-4">{p.descricao}</td>
                    {!categoria && <td className="py-2 pr-4 text-gray-600">{p.categoria}</td>}
                    <td className="py-2 pr-4 text-gray-600">{p.unidade ?? "—"}</td>
                    <td className="py-2 pr-4 font-medium text-brand-olive">
                      {formatMoney(tabela === "A" ? p.precoTabelaA : p.precoTabelaB)}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {p.ipiPercentual ? `${p.ipiPercentual}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
