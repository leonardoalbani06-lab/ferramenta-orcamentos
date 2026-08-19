"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Cliente } from "@prisma/client";
import { contemBusca, contemBuscaNumerica } from "@/lib/search";

export function ClientesList({ clientes }: { clientes: Cliente[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    if (!busca.trim()) return clientes;
    return clientes.filter(
      (c) =>
        contemBusca(c.razaoSocial, busca) ||
        contemBusca(c.nomeFantasia, busca) ||
        contemBuscaNumerica(c.cnpj, busca)
    );
  }, [clientes, busca]);

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
          placeholder="Buscar por nome, razão social ou CNPJ"
          className="w-full rounded-lg border border-brand-olive/20 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
        />
      </div>

      {clientes.length === 0 ? (
        <p className="text-gray-500">Nenhum cliente cadastrado ainda.</p>
      ) : filtrados.length === 0 ? (
        <p className="text-gray-500">Nenhum cliente encontrado pra &quot;{busca}&quot;.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtrados.map((c) => (
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
                className="mt-4 inline-block rounded-lg border border-brand-gold/40 px-3 py-2 text-xs font-medium text-brand-olive transition hover:bg-brand-limeLight"
              >
                Novo orçamento
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
