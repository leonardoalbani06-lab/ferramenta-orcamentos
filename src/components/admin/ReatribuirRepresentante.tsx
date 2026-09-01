"use client";

import { alterarRepresentanteCliente } from "@/app/admin/actions";

// Select que troca o representante responsável por um cliente assim que o
// admin escolhe outra opção (sem precisar de botão "Salvar" separado).
// Usado tanto na lista /admin/clientes quanto no detalhe de um orçamento
// em /admin/orcamentos/[id] — ver comentário em alterarRepresentanteCliente
// (src/app/admin/actions.ts) sobre o que muda e o que fica como está.
export function ReatribuirRepresentante({
  clienteId,
  representanteAtualId,
  representantes,
  paginaAtual,
}: {
  clienteId: string;
  representanteAtualId: string;
  representantes: { id: string; nome: string; ativo: boolean }[];
  paginaAtual: string;
}) {
  return (
    <form action={alterarRepresentanteCliente} className="inline-flex items-center gap-2">
      <input type="hidden" name="clienteId" value={clienteId} />
      <input type="hidden" name="paginaAtual" value={paginaAtual} />
      <select
        name="representanteId"
        defaultValue={representanteAtualId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Representante responsável"
        className="rounded-md border border-brand-olive/20 bg-white px-2 py-1.5 text-xs font-medium text-brand-oliveDark outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
      >
        {representantes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.nome}
            {!r.ativo ? " (desativado)" : ""}
          </option>
        ))}
      </select>
    </form>
  );
}
