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
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold mb-6">Catálogo</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <form method="get" className="flex gap-2">
          <input type="hidden" name="categoria" value={categoria} />
          <input type="hidden" name="tabela" value={tabela} />
          <input
            type="text"
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por descrição ou código"
            className="rounded border border-gray-300 px-3 py-2 text-sm w-64"
          />
          <button
            type="submit"
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Buscar
          </button>
        </form>

        <div className="flex gap-1 text-sm">
          {(["A", "B"] as Tabela[]).map((t) => (
            <a
              key={t}
              href={buildQuery({ categoria, busca, tabela: t })}
              className={`rounded px-3 py-2 ${
                tabela === t ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"
              }`}
            >
              Tabela {t}
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 text-sm">
        <a
          href={buildQuery({ categoria: undefined, busca, tabela })}
          className={`rounded px-3 py-1 ${
            !categoria ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"
          }`}
        >
          Todas
        </a>
        {categorias.map((c) => (
          <a
            key={c}
            href={buildQuery({ categoria: c, busca, tabela })}
            className={`rounded px-3 py-1 ${
              categoria === c ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"
            }`}
          >
            {c}
          </a>
        ))}
      </div>

      {produtosFiltrados.length === 0 ? (
        <p className="text-gray-600">Nenhum produto encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
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
                <tr key={p.codigo} className="border-b border-gray-100">
                  <td className="py-2 pr-4">
                    <ProdutoThumb imagemUrl={p.imagemUrl} descricao={p.descricao} size={36} />
                  </td>
                  <td className="py-2 pr-4 text-gray-500">{p.codigo}</td>
                  <td className="py-2 pr-4">{p.descricao}</td>
                  {!categoria && <td className="py-2 pr-4 text-gray-600">{p.categoria}</td>}
                  <td className="py-2 pr-4 text-gray-600">{p.unidade ?? "—"}</td>
                  <td className="py-2 pr-4 font-medium">
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
      )}
    </main>
  );
}
