import { db } from "@/lib/db";
import { criarRepresentante } from "../actions";
import { RepresentantesAdminList } from "./RepresentantesAdminList";

export default async function RepresentantesPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; sucesso?: string }>;
}) {
  const { erro, sucesso } = await searchParams;

  const representantes = await db.representante.findMany({
    orderBy: { nome: "asc" },
  });

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <h1 className="font-heading mb-6 text-2xl font-bold text-brand-olive">
        Representantes
      </h1>

      {erro && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}
      {sucesso && (
        <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {sucesso}
        </p>
      )}

      <section className="mb-8 rounded-xl border border-brand-olive/10 p-4 sm:p-6">
        <h2 className="font-heading mb-4 text-lg font-semibold text-brand-olive">
          Novo representante
        </h2>
        <form
          action={criarRepresentante}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Campo label="Nome *" name="nome" required className="sm:col-span-2" />
          <Campo label="Usuário *" name="username" required autoComplete="off" />
          <Campo
            label="Senha inicial *"
            name="password"
            type="password"
            required
            autoComplete="new-password"
          />
          <label className="flex items-center gap-2 text-sm text-brand-olive sm:col-span-2">
            <input type="checkbox" name="role" value="ADMIN" className="h-4 w-4" />
            Também é admin (acessa este painel)
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-brand-olive px-4 py-2.5 font-medium text-white transition hover:bg-brand-oliveDark"
            >
              Criar conta
            </button>
          </div>
        </form>
      </section>

      <RepresentantesAdminList representantes={representantes} />
    </main>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
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
        autoComplete={autoComplete}
        className="rounded-lg border border-brand-olive/20 px-3 py-2.5 outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
      />
    </div>
  );
}
