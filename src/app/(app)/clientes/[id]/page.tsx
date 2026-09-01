import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getRepresentanteId } from "@/lib/session";
import { HistoricoOrcamentosCliente } from "@/components/HistoricoOrcamentosCliente";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const representanteId = await getRepresentanteId();
  if (!representanteId) redirect("/");

  // Isolamento igual ao resto do app: só o cliente do próprio representante.
  const cliente = await db.cliente.findFirst({
    where: { id, representanteId },
    include: { orcamentos: { orderBy: { criadoEm: "desc" } } },
  });
  if (!cliente) redirect("/clientes");

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-8">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-brand-olive">{cliente.razaoSocial}</h1>
        <Link
          href={`/orcamentos/novo?clienteId=${cliente.id}`}
          className="shrink-0 rounded-lg bg-brand-olive px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-oliveDark"
        >
          Novo orçamento
        </Link>
      </div>
      {cliente.nomeFantasia && <p className="mb-6 text-sm text-gray-500">{cliente.nomeFantasia}</p>}

      <section className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-brand-cream p-4 text-sm sm:grid-cols-2">
        <Info label="Código do cliente" valor={cliente.codigoCliente} />
        <Info label="CNPJ" valor={cliente.cnpj} />
        <Info label="Inscrição estadual" valor={cliente.inscricaoEstadual} />
        <Info label="Telefone" valor={cliente.telefone} />
        <Info label="E-mail" valor={cliente.email} />
        <Info label="Endereço" valor={cliente.endereco} />
        <Info label="Bairro" valor={cliente.bairro} />
        <Info label="CEP" valor={cliente.cep} />
        <Info
          label="Município"
          valor={[cliente.municipio, cliente.uf].filter(Boolean).join(" / ") || null}
        />
      </section>

      <section>
        <h2 className="font-heading mb-3 text-lg font-bold text-brand-olive">
          Histórico de orçamentos
        </h2>
        <HistoricoOrcamentosCliente orcamentos={cliente.orcamentos} basePath="/orcamentos" />
      </section>

      <Link
        href="/clientes"
        className="mt-6 inline-block text-sm text-gray-500 hover:text-brand-olive hover:underline"
      >
        ← Voltar para clientes
      </Link>
    </main>
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
