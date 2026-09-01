import { db } from "@/lib/db";
import { ClientesAdminList } from "./ClientesAdminList";

export default async function ClientesAdminPage() {
  const [clientes, representantes] = await Promise.all([
    db.cliente.findMany({
      include: { representante: true },
      orderBy: { razaoSocial: "asc" },
    }),
    db.representante.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-olive">Clientes</h1>
        <p className="text-sm text-gray-500">
          Cadastros de todos os representantes. Troque o representante responsável direto na
          lista, se precisar.
        </p>
      </div>

      <ClientesAdminList clientes={clientes} representantes={representantes} />
    </main>
  );
}
