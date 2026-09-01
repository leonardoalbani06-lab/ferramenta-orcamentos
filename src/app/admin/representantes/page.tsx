import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import {
  alternarAtivoRepresentante,
  criarRepresentante,
  redefinirSenhaRepresentante,
} from "../actions";

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

      <section className="rounded-xl border border-brand-olive/10">
        <table className="hidden w-full text-left text-sm sm:table">
          <thead>
            <tr className="border-b border-brand-olive/10 text-xs uppercase text-brand-olive/60">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {representantes.map((r) => (
              <tr key={r.id} className="border-b border-brand-olive/5 last:border-0">
                <td className="px-4 py-3 font-medium text-brand-oliveDark">{r.nome}</td>
                <td className="px-4 py-3 text-brand-oliveDark/70">{r.username}</td>
                <td className="px-4 py-3 text-brand-oliveDark/70">
                  {r.role === "ADMIN" ? "Admin" : "Representante"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge ativo={r.ativo} />
                </td>
                <td className="px-4 py-3 text-brand-oliveDark/70">{formatDate(r.criadoEm)}</td>
                <td className="px-4 py-3">
                  <AcoesRepresentante id={r.id} ativo={r.ativo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile: cards */}
        <div className="divide-y divide-brand-olive/10 sm:hidden">
          {representantes.map((r) => (
            <div key={r.id} className="p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-medium text-brand-oliveDark">{r.nome}</p>
                <StatusBadge ativo={r.ativo} />
              </div>
              <p className="mb-3 text-sm text-brand-oliveDark/60">
                {r.username} · {r.role === "ADMIN" ? "Admin" : "Representante"}
              </p>
              <AcoesRepresentante id={r.id} ativo={r.ativo} />
            </div>
          ))}
        </div>

        {representantes.length === 0 && (
          <p className="p-6 text-center text-sm text-brand-oliveDark/50">
            Nenhum representante cadastrado ainda.
          </p>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        ativo ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {ativo ? "Ativo" : "Desativado"}
    </span>
  );
}

function AcoesRepresentante({ id, ativo }: { id: string; ativo: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={alternarAtivoRepresentante}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="ativo" value={String(ativo)} />
        <button
          type="submit"
          className="rounded border border-brand-olive/20 px-2.5 py-1 text-xs font-medium text-brand-olive transition hover:bg-brand-olive/5"
        >
          {ativo ? "Desativar" : "Reativar"}
        </button>
      </form>

      <details className="relative">
        <summary className="cursor-pointer list-none rounded border border-brand-olive/20 px-2.5 py-1 text-xs font-medium text-brand-olive transition hover:bg-brand-olive/5 [&::-webkit-details-marker]:hidden">
          Redefinir senha
        </summary>
        <form
          action={redefinirSenhaRepresentante}
          className="absolute left-0 top-9 z-10 flex w-56 flex-col gap-2 rounded-lg border border-brand-olive/20 bg-white p-3 shadow-xl"
        >
          <input type="hidden" name="id" value={id} />
          <input
            type="password"
            name="novaSenha"
            placeholder="Nova senha"
            required
            autoComplete="new-password"
            className="rounded border border-brand-olive/20 px-2 py-1.5 text-sm outline-none focus:border-brand-olive"
          />
          <button
            type="submit"
            className="rounded bg-brand-olive px-2 py-1.5 text-xs font-medium text-white hover:bg-brand-oliveDark"
          >
            Salvar nova senha
          </button>
        </form>
      </details>
    </div>
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
