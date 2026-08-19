import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getRepresentanteId } from "@/lib/session";
import { OrcamentoBuilder } from "./OrcamentoBuilder";

export default async function NovoOrcamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; erro?: string }>;
}) {
  const { clienteId, erro } = await searchParams;

  const representanteId = await getRepresentanteId();
  if (!representanteId) redirect("/");

  const [clientes, produtos] = await Promise.all([
    db.cliente.findMany({
      where: { representanteId },
      orderBy: { razaoSocial: "asc" },
      select: { id: true, razaoSocial: true, cnpj: true },
    }),
    db.produto.findMany({
      where: { ativo: true },
      orderBy: [{ categoria: "asc" }, { descricao: "asc" }],
      select: {
        codigo: true,
        descricao: true,
        categoria: true,
        unidade: true,
        precoTabelaA: true,
        precoTabelaB: true,
        ipiPercentual: true,
        imagemUrl: true,
      },
    }),
  ]);

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <h1 className="font-heading mb-6 text-2xl font-bold text-brand-olive">Novo orçamento</h1>

      {erro && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}

      {clientes.length === 0 ? (
        <p className="text-gray-500">
          Você ainda não tem clientes cadastrados.{" "}
          <Link href="/clientes/novo" className="text-brand-olive underline">
            Cadastre um cliente
          </Link>{" "}
          antes de montar um orçamento.
        </p>
      ) : (
        <OrcamentoBuilder clientes={clientes} produtos={produtos} clienteIdInicial={clienteId} />
      )}
    </main>
  );
}
