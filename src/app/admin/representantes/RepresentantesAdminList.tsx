"use client";

import { useMemo, useState } from "react";
import type { Representante } from "@prisma/client";
import { formatDate, formatDateTime } from "@/lib/format";
import { AlterarRoleRepresentante } from "@/components/admin/AlterarRoleRepresentante";
import {
  alternarAtivoRepresentante,
  redefinirSenhaRepresentante,
} from "../actions";

export function RepresentantesAdminList({
  representantes,
}: {
  representantes: Representante[];
}) {
  const [filtroId, setFiltroId] = useState("");

  const filtrados = useMemo(() => {
    if (!filtroId) return representantes;
    return representantes.filter((r) => r.id === filtroId);
  }, [representantes, filtroId]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="filtroRepresentante" className="text-sm font-medium text-brand-olive">
          Filtrar por representante
        </label>
        <select
          id="filtroRepresentante"
          value={filtroId}
          onChange={(e) => setFiltroId(e.target.value)}
          className="rounded-lg border border-brand-olive/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20 sm:w-64"
        >
          <option value="">Todos</option>
          {representantes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nome}
            </option>
          ))}
        </select>
      </div>

      <section className="rounded-xl border border-brand-olive/10">
        <table className="hidden w-full text-left text-sm sm:table">
          <thead>
            <tr className="border-b border-brand-olive/10 text-xs uppercase text-brand-olive/60">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3">Último login</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((r) => (
              <tr key={r.id} className="border-b border-brand-olive/5 last:border-0">
                <td className="px-4 py-3 font-medium text-brand-oliveDark">{r.nome}</td>
                <td className="px-4 py-3 text-brand-oliveDark/70">{r.username}</td>
                <td className="px-4 py-3">
                  <AlterarRoleRepresentante id={r.id} roleAtual={r.role} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge ativo={r.ativo} />
                </td>
                <td className="px-4 py-3 text-brand-oliveDark/70">{formatDate(r.criadoEm)}</td>
                <td className="px-4 py-3 text-brand-oliveDark/70">
                  {r.ultimoLoginEm ? formatDateTime(r.ultimoLoginEm) : "Nunca"}
                </td>
                <td className="px-4 py-3">
                  <AcoesRepresentante id={r.id} ativo={r.ativo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile: cards */}
        <div className="divide-y divide-brand-olive/10 sm:hidden">
          {filtrados.map((r) => (
            <div key={r.id} className="p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-medium text-brand-oliveDark">{r.nome}</p>
                <StatusBadge ativo={r.ativo} />
              </div>
              <p className="mb-2 text-sm text-brand-oliveDark/60">{r.username}</p>
              <p className="mb-3 text-xs text-brand-oliveDark/50">
                Último login: {r.ultimoLoginEm ? formatDateTime(r.ultimoLoginEm) : "Nunca"}
              </p>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">Papel:</span>
                <AlterarRoleRepresentante id={r.id} roleAtual={r.role} />
              </div>
              <AcoesRepresentante id={r.id} ativo={r.ativo} />
            </div>
          ))}
        </div>

        {filtrados.length === 0 && (
          <p className="p-6 text-center text-sm text-brand-oliveDark/50">
            Nenhum representante encontrado.
          </p>
        )}
      </section>
    </>
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
