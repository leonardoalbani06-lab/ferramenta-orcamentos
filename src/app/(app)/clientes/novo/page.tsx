import { criarCliente } from "../../../actions";

export default async function NovoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-8">
      <h1 className="font-heading mb-6 text-2xl font-bold text-brand-olive">Novo cliente</h1>

      {erro && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}

      <form action={criarCliente} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Razão social *" name="razaoSocial" required className="sm:col-span-2" />
        <Campo label="Nome fantasia" name="nomeFantasia" className="sm:col-span-2" />
        <Campo label="CNPJ *" name="cnpj" required />
        <Campo label="Inscrição estadual" name="inscricaoEstadual" />
        <Campo label="Endereço" name="endereco" className="sm:col-span-2" />
        <Campo label="Bairro" name="bairro" />
        <Campo label="CEP" name="cep" />
        <Campo label="Município" name="municipio" />
        <Campo label="UF" name="uf" maxLength={2} />
        <Campo label="Telefone" name="telefone" />
        <Campo label="E-mail" name="email" type="email" />

        <div className="mt-2 flex gap-3 sm:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-brand-olive px-4 py-2.5 font-medium text-white transition hover:bg-brand-oliveDark"
          >
            Salvar
          </button>
          <a
            href="/clientes"
            className="rounded-lg px-4 py-2.5 text-gray-600 transition hover:text-brand-olive hover:underline"
          >
            Cancelar
          </a>
        </div>
      </form>
    </main>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required = false,
  maxLength,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
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
        className="rounded-lg border border-brand-olive/20 px-3 py-2.5 outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
      />
    </div>
  );
}
