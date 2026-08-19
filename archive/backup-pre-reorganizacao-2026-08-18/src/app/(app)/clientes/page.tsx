import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getRepresentanteId } from "@/lib/session";

export default async function ClientesPage() {
  const representanteId = await getRepresentanteId();
  if (!representanteId) redirect("/");

  const clientes = await db.cliente.findMany({
    where: { representanteId },
    orderBy: { razaoSocial: "asc" },
  });

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-brand-olive">Clientes</h1>
        <Link
          href="/clientes/novo"
          className="rounded-lg bg-brand-olive px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-oliveDark"
        >
          + Novo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <p className="text-gray-500">Nenhum cliente cadastrado ainda.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {clientes.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-brand-cream bg-white p-5 shadow-sm transition hover:shadow-md hover:border-brand-gold/30"
            >
              <p className="font-medium text-brand-olive">{c.razaoSocial}</p>
              {c.nomeFantasia && <p className="text-sm text-gray-500">{c.nomeFantasia}</p>}
              <p className="mt-2 text-sm text-gray-600">CNPJ: {c.cnpj}</p>
              {(c.municipio || c.uf) && (
                <p className="text-sm text-gray-600">
                  {[c.municipio, c.uf].filter(Boolean).join(" / ")}
                </p>
              )}
              {c.telefone && <p className="text-sm text-gray-600">{c.telefone}</p>}

              <Link
                href={`/orcamentos/novo?clienteId=${c.id}`}
                className="mt-4 inline-block rounded-lg border border-brand-gold/40 px-3 py-1.5 text-xs font-medium text-brand-olive transition hover:bg-brand-limeLight"
              >
                Novo orçamento
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
