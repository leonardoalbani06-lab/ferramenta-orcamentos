"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Orcamento, Cliente, Representante } from "@prisma/client";
import { contemBusca, contemBuscaNumerica } from "@/lib/search";
import { formatDate, formatMoney } from "@/lib/format";

type OrcamentoComRelacoes = Orcamento & {
  cliente: Cliente & { representante: Representante };
};

export function OrcamentosAdminList({
  orcamentos,
}: {
  orcamentos: OrcamentoComRelacoes[];
}) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    if (!busca.trim()) return orcamentos;
    return orcamentos.filter(
      (o) =>
        contemBuscaNumerica(o.id, busca) ||
        contemBusca(o.cliente.razaoSocial, busca) ||
        contemBusca(o.cliente.nomeFantasia, busca) ||
        contemBusca(o.cliente.representante.nome, busca)
    );
  }, [orcamentos, busca]);

  return (
    <>
      <div className="relative mb-6">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-olive/40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nº do orçamento, cliente ou representante"
          className="w-full rounded-lg border border-brand-olive/20 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
        />
      </div>

      {orcamentos.length === 0 ? (
        <p className="text-gray-500">Nenhum orçamento criado ainda.</p>
      ) : filtrados.length === 0 ? (
        <p className="text-gray-500">Nenhum orçamento encontrado pra &quot;{busca}&quot;.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtrados.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orcamentos/${o.id}`}
                className="block rounded-xl border border-brand-cream p-4 transition hover:border-brand-gold/40 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-brand-olive">Orçamento nº {o.id}</p>
                  <p className="font-medium text-brand-olive">{formatMoney(o.valorTotal)}</p>
                </div>
                <p className="text-sm text-gray-600">{o.cliente.razaoSocial}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm text-gray-500">{formatDate(o.data)}</p>
                  <p className="rounded-full bg-brand-limeLight px-2 py-0.5 text-xs font-medium text-brand-oliveDark">
                    {o.cliente.representante.nome}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
