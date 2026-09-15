"use client";

import { useState } from "react";

// Janela pra ver/editar a observação de UM item do orçamento. Usada tanto
// na montagem de um orçamento novo (observação só fica no estado local, até
// salvar o orçamento inteiro) quanto num orçamento já salvo (aí "onSalvar"
// chama a ação do servidor de verdade). Fechar com o "✕" descarta qualquer
// texto digitado e não digitado — some volta pro valor que já estava salvo.
export function ObservacaoModal({
  produtoDescricao,
  valorInicial,
  somenteLeitura = false,
  onSalvar,
  onFechar,
}: {
  produtoDescricao: string;
  valorInicial: string;
  somenteLeitura?: boolean;
  onSalvar: (texto: string) => void | Promise<void>;
  onFechar: () => void;
}) {
  const [texto, setTexto] = useState(valorInicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar(texto.trim());
      onFechar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar a observação.");
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-brand-olive">{produtoDescricao}</p>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar sem salvar"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg leading-none text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Observação:"
          rows={4}
          readOnly={somenteLeitura}
          autoFocus={!somenteLeitura}
          maxLength={500}
          className="w-full rounded-lg border border-brand-olive/20 px-3 py-2.5 text-sm outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20 read-only:bg-gray-50 read-only:text-gray-600"
        />

        {somenteLeitura ? (
          <p className="mt-2 text-xs text-gray-500">
            Este orçamento já teve o PDF gerado — a observação não pode mais ser alterada.
          </p>
        ) : (
          <p className="mt-1 text-right text-xs text-gray-400">{texto.length}/500</p>
        )}
        {erro && <p className="mt-2 text-xs text-red-600">{erro}</p>}

        {!somenteLeitura && (
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onFechar}
              className="rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:text-brand-olive"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="rounded-lg bg-brand-olive px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-oliveDark disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
