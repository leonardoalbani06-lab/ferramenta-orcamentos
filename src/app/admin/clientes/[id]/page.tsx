import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { atualizarClienteAdmin } from "../../actions";
import { ReatribuirRepresentante } from "@/components/admin/ReatribuirRepresentante";
import { HistoricoOrcamentosCliente } from "@/components/HistoricoOrcamentosCliente";

export default async function ClienteAdminDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string; sucesso?: string }>;
}) {
  const { id } = await params;
  const { erro, sucesso } = await searchParams;

  const [cliente, representantes] = await Promise.all([
    db.cliente.findUnique({
      where: { id },
      include: { orcamentos: { orderBy: { criadoEm: "desc" } } },
    }),
    db.representante.findMany({ orderBy: { nome: "asc" } }),
  ]);
  if (!cliente) redirect("/admin/clientes");

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-brand-olive">{cliente.razaoSocial}</h1>
        <ReatribuirRepresentante
          clienteId={cliente.id}
          representanteAtualId={cliente.representanteId}
          representantes={representantes}
          paginaAtual={`/admin/clientes/${cliente.id}`}
        />
      </div>

      {erro && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}
      {sucesso && (
        <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{sucesso}</p>
      )}

      <form
        action={atualizarClienteAdmin}
        className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-brand-olive/10 p-4 sm:grid-cols-2 sm:p-6"
      >
        <input type="hidden" name="id" value={cliente.id} />
        <Campo label="Código do cliente" name="codigoCliente" defaultValue={cliente.codigoCliente} />
        <Campo label="CNPJ *" name="cnpj" required defaultValue={cliente.cnpj} />
        <Campo
          label="Razão social *"
          name="razaoSocial"
          required
          defaultValue={cliente.razaoSocial}
          className="sm:col-span-2"
        />
        <Campo
          label="Nome fantasia"
          name="nomeFantasia"
          defaultValue={cliente.nomeFantasia}
          className="sm:col-span-2"
        />
        <Campo
          label="Inscrição estadual"
          name="inscricaoEstadual"
          defaultValue={cliente.inscricaoEstadual}
        />
        <Campo label="Telefone" name="telefone" defaultValue={cliente.telefone} />
        <Campo
          label="Endereço"
          name="endereco"
          defaultValue={cliente.endereco}
          className="sm:col-span-2"
        />
        <Campo label="Bairro" name="bairro" defaultValue={cliente.bairro} />
        <Campo label="CEP" name="cep" defaultValue={cliente.cep} />
        <Campo label="Município" name="municipio" defaultValue={cliente.municipio} />
        <Campo label="UF" name="uf" maxLength={2} defaultValue={cliente.uf} />
        <Campo label="E-mail" name="email" type="email" defaultValue={cliente.email} />

        <div className="mt-2 flex gap-3 sm:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-brand-olive px-4 py-2.5 font-medium text-white transition hover:bg-brand-oliveDark"
          >
            Salvar
          </button>
          <Link
            href="/admin/clientes"
            className="rounded-lg px-4 py-2.5 text-gray-600 transition hover:text-brand-olive hover:underline"
          >
            Voltar
          </Link>
        </div>
      </form>

      <section>
        <h2 className="font-heading mb-3 text-lg font-bold text-brand-olive">
          Histórico de orçamentos
        </h2>
        <HistoricoOrcamentosCliente orcamentos={cliente.orcamentos} basePath="/admin/orcamentos" />
      </section>
    </main>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required = false,
  maxLength,
  defaultValue,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  defaultValue?: string | null;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={name} className="text-sm font-medium text-brand-olive">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        defaultValue={defaultValue ?? ""}
        className="rounded-lg border border-brand-olive/20 px-3 py-2.5 outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
      />
    </div>
  );
}
