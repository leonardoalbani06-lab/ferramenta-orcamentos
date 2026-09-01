"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Cliente, Representante } from "@prisma/client";
import { contemBusca, contemBuscaNumerica } from "@/lib/search";
import { ReatribuirRepresentante } from "@/components/admin/ReatribuirRepresentante";

type ClienteComRepresentante = Cliente & { representante: Representante };

export function ClientesAdminList({
  clientes,
  representantes,
}: {
  clientes: ClienteComRepresentante[];
  representantes: Representante[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState("");
  const [filtroRepresentanteId, setFiltroRepresentanteId] = useState(
    searchParams.get("representanteId") ?? ""
  );

  function mudarFiltro(id: string) {
    setFiltroRepresentanteId(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("representanteId", id);
    else params.delete("representanteId");
    router.replace(`/admin/clientes${params.toString() ? `?${params}` : ""}`);
  }

  const porRepresentante = useMemo(() => {
    if (!filtroRepresentanteId) return clientes;
    return clientes.filter((c) => c.representanteId === filtroRepresentanteId);
  }, [clientes, filtroRepresentanteId]);

  const filtrados = useMemo(() => {
    if (!busca.trim()) return porRepresentante;
    return porRepresentante.filter(
      (c) =>
        contemBusca(c.razaoSocial, busca) ||
        contemBusca(c.nomeFantasia, busca) ||
        contemBuscaNumerica(c.cnpj, busca) ||
        contemBusca(c.codigoCliente, busca) ||
        contemBusca(c.representante.nome, busca)
    );
  }, [porRepresentante, busca]);

  const representanteFiltrado = representantes.find((r) => r.id === filtroRepresentanteId);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
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
            placeholder="Buscar por nome, razão social, CNPJ, código ou representante"
            className="w-full rounded-lg border border-brand-olive/20 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
          />
        </div>

        <select
          value={filtroRepresentanteId}
          onChange={(e) => mudarFiltro(e.target.value)}
          aria-label="Filtrar por representante"
          className="rounded-lg border border-brand-olive/20 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20 sm:w-56"
        >
          <option value="">Todos os representantes</option>
          {representantes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nome}
            </option>
          ))}
        </select>
      </div>

      {representanteFiltrado && (
        <p className="mb-4 rounded-lg bg-brand-limeLight px-3 py-2 text-sm text-brand-oliveDark">
          <strong>{representanteFiltrado.nome}</strong>: {porRepresentante.length}{" "}
          {porRepresentante.length === 1 ? "cliente" : "clientes"}
        </p>
      )}

      {clientes.length === 0 ? (
        <p className="text-gray-500">Nenhum cliente cadastrado ainda.</p>
      ) : filtrados.length === 0 ? (
        <p className="text-gray-500">Nenhum cliente encontrado.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtrados.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-brand-cream bg-white p-5 shadow-sm transition hover:shadow-md hover:border-brand-gold/30"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-brand-olive">{c.razaoSocial}</p>
                <Link
                  href={`/admin/clientes/${c.id}`}
                  className="shrink-0 text-xs font-medium text-brand-olive underline-offset-2 hover:underline"
                >
                  Editar
                </Link>
              </div>
              {c.nomeFantasia && <p className="text-sm text-gray-500">{c.nomeFantasia}</p>}
              <p className="mt-2 text-sm text-gray-600">CNPJ: {c.cnpj}</p>
              <p className="text-sm text-gray-600">Código: {c.codigoCliente || "—"}</p>
              {(c.municipio || c.uf) && (
                <p className="text-sm text-gray-600">
                  {[c.municipio, c.uf].filter(Boolean).join(" / ")}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-brand-cream pt-3">
                <p className="text-xs text-gray-500">Representante responsável</p>
                <ReatribuirRepresentante
                  clienteId={c.id}
                  representanteAtualId={c.representanteId}
                  representantes={representantes}
                  paginaAtual="/admin/clientes"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
