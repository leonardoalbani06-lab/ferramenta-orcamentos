"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Orcamento, Cliente, Representante } from "@prisma/client";
import { contemBusca, contemBuscaNumerica } from "@/lib/search";
import { formatDate, formatMoney } from "@/lib/format";

type OrcamentoComRelacoes = Orcamento & {
  cliente: Cliente & { representante: Representante };
};

export function OrcamentosAdminList({
  orcamentos,
  representantes,
}: {
  orcamentos: OrcamentoComRelacoes[];
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
    router.replace(`/admin/orcamentos${params.toString() ? `?${params}` : ""}`);
  }

  const porRepresentante = useMemo(() => {
    if (!filtroRepresentanteId) return orcamentos;
    return orcamentos.filter((o) => o.cliente.representanteId === filtroRepresentanteId);
  }, [orcamentos, filtroRepresentanteId]);

  const filtrados = useMemo(() => {
    if (!busca.trim()) return porRepresentante;
    return porRepresentante.filter(
      (o) =>
        contemBuscaNumerica(o.id, busca) ||
        contemBusca(o.cliente.razaoSocial, busca) ||
        contemBusca(o.cliente.nomeFantasia, busca) ||
        contemBusca(o.cliente.codigoCliente, busca) ||
        contemBusca(o.cliente.representante.nome, busca)
    );
  }, [porRepresentante, busca]);

  const representanteFiltrado = representantes.find((r) => r.id === filtroRepresentanteId);

  const resumo = useMemo(() => {
    if (!representanteFiltrado) return null;
    const agora = new Date();
    const doMes = porRepresentante.filter(
      (o) => o.data.getFullYear() === agora.getFullYear() && o.data.getMonth() === agora.getMonth()
    );
    const somaMes = doMes.reduce((acc, o) => acc + o.valorTotal, 0);
    return { totalMes: doMes.length, totalGeral: porRepresentante.length, somaMes };
  }, [porRepresentante, representanteFiltrado]);

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
            placeholder="Buscar por nº do orçamento, cliente, código ou representante"
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

      {representanteFiltrado && resumo && (
        <div className="mb-4 flex flex-wrap gap-3 rounded-lg bg-brand-limeLight px-3 py-2 text-sm text-brand-oliveDark">
          <strong>{representanteFiltrado.nome}</strong>
          <span>· {resumo.totalMes} orçamentos este mês</span>
          <span>· {resumo.totalGeral} no total</span>
          <span>· {formatMoney(resumo.somaMes)} em orçamentos este mês</span>
        </div>
      )}

      {orcamentos.length === 0 ? (
        <p className="text-gray-500">Nenhum orçamento criado ainda.</p>
      ) : filtrados.length === 0 ? (
        <p className="text-gray-500">Nenhum orçamento encontrado.</p>
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
                <p className="text-sm text-gray-600">
                  {o.cliente.nomeFantasia || o.cliente.razaoSocial}
                </p>
                <p className="text-xs text-gray-500">
                  Código: {o.cliente.codigoCliente || "—"}
                  {o.cliente.telefone ? ` · ${o.cliente.telefone}` : ""}
                </p>
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
