import { auth } from "@/auth";

// Mantém a mesma assinatura de antes (`getRepresentanteId`) pra não
// precisar tocar em todo lugar que já lê a sessão pra filtrar
// clientes/orçamentos do representante logado — só a implementação
// mudou, de cookie cru pra sessão do NextAuth.
export async function getRepresentanteId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function getRepresentanteLogado() {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id: session.user.id,
    nome: session.user.name ?? "",
    username: session.user.username,
    role: session.user.role,
  };
}
