"use client";

import { alterarRoleRepresentante } from "@/app/admin/actions";

// Mesmo padrão do ReatribuirRepresentante: select que já submete no
// próprio onChange, sem botão "Salvar" separado.
export function AlterarRoleRepresentante({
  id,
  roleAtual,
}: {
  id: string;
  roleAtual: string;
}) {
  return (
    <form action={alterarRoleRepresentante} className="inline-flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="role"
        defaultValue={roleAtual}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Papel"
        className="rounded-md border border-brand-olive/20 bg-white px-2 py-1.5 text-xs font-medium text-brand-oliveDark outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
      >
        <option value="REPRESENTANTE">Representante</option>
        <option value="ADMIN">Admin</option>
      </select>
    </form>
  );
}
