"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { getRepresentanteId, getRepresentanteLogado } from "@/lib/session";

export async function autenticar(formData: FormData) {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/clientes",
    });
  } catch (error) {
    // `signIn` com redirectTo lança um erro interno do Next.js pra fazer
    // o redirect — não é uma falha de login, então deixa passar direto.
    if (error instanceof AuthError) {
      redirect("/?erro=" + encodeURIComponent("Usuário ou senha inválidos."));
    }
    throw error;
  }
}

export async function sairRepresentante() {
  await signOut({ redirectTo: "/" });
}

export async function criarCliente(formData: FormData) {
  const representanteId = await getRepresentanteId();
  if (!representanteId) redirect("/");

  const razaoSocial = String(formData.get("razaoSocial") ?? "").trim();
  const cnpj = String(formData.get("cnpj") ?? "").trim();
  const codigoCliente = String(formData.get("codigoCliente") ?? "").trim();

  if (!razaoSocial || !cnpj || !codigoCliente) {
    redirect(
      "/clientes/novo?erro=" +
        encodeURIComponent("Código do cliente, razão social e CNPJ são obrigatórios.")
    );
  }

  // CNPJ é único globalmente (não só por representante) — checa antes de
  // tentar criar pra poder mostrar de quem já é o cliente, em vez de só um
  // erro genérico de duplicidade.
  const clienteExistente = await db.cliente.findUnique({
    where: { cnpj },
    include: { representante: true },
  });
  if (clienteExistente) {
    redirect(
      "/clientes/novo?erro=" +
        encodeURIComponent(
          `Esse CNPJ já está cadastrado, em nome do representante ${clienteExistente.representante.nome}.`
        )
    );
  }

  const campo = (name: string) => {
    const valor = String(formData.get(name) ?? "").trim();
    return valor || null;
  };

  try {
    await db.cliente.create({
      data: {
        representanteId,
        codigoCliente,
        razaoSocial,
        cnpj,
        nomeFantasia: campo("nomeFantasia"),
        inscricaoEstadual: campo("inscricaoEstadual"),
        endereco: campo("endereco"),
        bairro: campo("bairro"),
        cep: campo("cep"),
        municipio: campo("municipio"),
        uf: campo("uf"),
        telefone: campo("telefone"),
        email: campo("email"),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(
        "/clientes/novo?erro=" +
          encodeURIComponent("Você já cadastrou um cliente com esse CNPJ.")
      );
    }
    throw error;
  }

  redirect("/clientes");
}

type ItemInput = { codigo: string; quantidade: number; tabela: string; observacao?: string };

// Observação por item: texto livre, mas com um limite de tamanho —
// evita abuso e mantém o PDF legível (a observação entra na mesma célula
// da descrição do produto).
const OBSERVACAO_MAX_LENGTH = 500;

function normalizarObservacao(valor: unknown): string | null {
  const texto = String(valor ?? "").trim();
  if (!texto) return null;
  return texto.slice(0, OBSERVACAO_MAX_LENGTH);
}

// Mesmas opções mostradas nos <select> do formulário (ver OrcamentoBuilder)
// — validadas de novo aqui pra não gravar valor arbitrário se o formulário
// for contornado (o app só monta HTML dessas opções, nunca deixa digitar).
const OPCOES_FORMA_PAGAMENTO = new Set(["Boletos", "Cheque", "Dinheiro", "Pix"]);
const OPCOES_CONDICAO_PAGAMENTO = new Set([
  "À vista",
  "21-28-35",
  "21-28-35-42",
  "21-28-35-42-49",
  "21-28-35-42-49-56",
]);
const OPCOES_FRETE = new Set(["CIF", "FOB"]);

function campoTexto(formData: FormData, name: string): string | null {
  const valor = String(formData.get(name) ?? "").trim();
  return valor || null;
}

function opcaoValida(formData: FormData, name: string, opcoesValidas: Set<string>): string | null {
  const valor = campoTexto(formData, name);
  return valor && opcoesValidas.has(valor) ? valor : null;
}

// Lê os itens do formulário (JSON escondido, ver OrcamentoBuilder), valida
// contra o catálogo de produtos e recalcula tudo no servidor — preço,
// descrição, IPI, volumes e peso bruto NUNCA vêm do que o cliente manda
// (mesma regra de "nunca confiar no client" do resto do projeto). Usada
// tanto por `criarOrcamento` quanto por `atualizarOrcamento`, pra não ter
// duas cópias da mesma lógica de cálculo divergindo com o tempo.
type ItemParaCriar = {
  produtoCodigo: string;
  descricao: string;
  quantidade: number;
  tabelaUsada: string;
  valorUnitario: number;
  ipiPercentual: number;
  valorTotal: number;
  observacao: string | null;
};

type ItensProcessados =
  | { erro: string }
  | {
      itensParaCriar: ItemParaCriar[];
      valorProdutos: number;
      descontoPercentual: number;
      descontoValor: number;
      ipiValor: number;
      freteValor: number;
      stValor: number;
      valorTotal: number;
      volumes: number;
      pesoBruto: number;
    };

async function processarItensDoFormulario(formData: FormData): Promise<ItensProcessados> {
  let itensInput: ItemInput[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("itens") ?? "[]"));
    if (Array.isArray(parsed)) {
      itensInput = parsed.filter(
        (i): i is ItemInput =>
          i && typeof i.codigo === "string" && Number(i.quantidade) > 0
      );
    }
  } catch {
    itensInput = [];
  }

  if (itensInput.length === 0) {
    return { erro: "Selecione ao menos um produto com quantidade." };
  }

  const codigos = itensInput.map((i) => i.codigo);
  const produtos = await db.produto.findMany({ where: { codigo: { in: codigos } } });
  const produtoPorCodigo = new Map(produtos.map((p) => [p.codigo, p]));

  const itensParaCriar = itensInput
    .map((i) => {
      const produto = produtoPorCodigo.get(i.codigo);
      if (!produto) return null;
      const quantidade = Math.trunc(Number(i.quantidade));
      const tabelaUsada = i.tabela === "B" ? "B" : "A";
      const valorUnitario = tabelaUsada === "A" ? produto.precoTabelaA : produto.precoTabelaB;
      const valorTotal = valorUnitario * quantidade;
      return {
        produtoCodigo: produto.codigo,
        descricao: produto.descricao,
        quantidade,
        tabelaUsada,
        valorUnitario,
        ipiPercentual: produto.ipiPercentual ?? 0,
        valorTotal,
        observacao: normalizarObservacao(i.observacao),
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  if (itensParaCriar.length === 0) {
    return { erro: "Nenhum produto válido selecionado." };
  }

  const valorProdutos = itensParaCriar.reduce((acc, i) => acc + i.valorTotal, 0);
  const descontoPercentual = Number(formData.get("descontoPercentual") ?? 0) || 0;
  const descontoValor = Math.round((valorProdutos * descontoPercentual) / 100);
  const ipiValor = itensParaCriar.reduce(
    (acc, i) => acc + Math.round((i.valorTotal * i.ipiPercentual) / 100),
    0
  );
  const freteValor = Math.round((Number(formData.get("freteValor") ?? 0) || 0) * 100);
  const stValor = Math.round((Number(formData.get("stValor") ?? 0) || 0) * 100);
  const valorTotal = valorProdutos - descontoValor + ipiValor + stValor + freteValor;

  // Volumes e peso bruto nunca vêm do formulário — são sempre recalculados
  // aqui a partir dos itens/produtos rebuscados no banco. Peso fica 0 pros
  // produtos que ainda não têm peso unitário cadastrado.
  const volumes = itensParaCriar.reduce((acc, i) => acc + i.quantidade, 0);
  const pesoBruto = itensParaCriar.reduce((acc, i) => {
    const peso = produtoPorCodigo.get(i.produtoCodigo)?.peso ?? 0;
    return acc + i.quantidade * peso;
  }, 0);

  return {
    itensParaCriar,
    valorProdutos,
    descontoPercentual,
    descontoValor,
    ipiValor,
    freteValor,
    stValor,
    valorTotal,
    volumes,
    pesoBruto,
  };
}

export async function criarOrcamento(formData: FormData) {
  const representanteId = await getRepresentanteId();
  if (!representanteId) redirect("/");

  const clienteId = String(formData.get("clienteId") ?? "");

  const resultado = await processarItensDoFormulario(formData);
  if ("erro" in resultado) {
    redirect("/orcamentos/novo?erro=" + encodeURIComponent(resultado.erro));
  }

  if (!clienteId) {
    redirect("/orcamentos/novo?erro=" + encodeURIComponent("Selecione o cliente."));
  }

  const cliente = await db.cliente.findFirst({ where: { id: clienteId, representanteId } });
  if (!cliente) {
    redirect("/orcamentos/novo?erro=" + encodeURIComponent("Cliente inválido."));
  }

  const {
    itensParaCriar,
    valorProdutos,
    descontoPercentual,
    descontoValor,
    ipiValor,
    freteValor,
    stValor,
    valorTotal,
    volumes,
    pesoBruto,
  } = resultado;

  const orcamento = await db.orcamento.create({
    data: {
      clienteId: cliente!.id,
      representanteId,
      valorProdutos,
      descontoPercentual: descontoPercentual || null,
      descontoValor,
      ipiValor,
      stValor,
      freteValor,
      valorTotal,
      previsaoEntrega: campoTexto(formData, "previsaoEntrega"),
      ordemCompra: campoTexto(formData, "ordemCompra"),
      fretePorConta: opcaoValida(formData, "fretePorConta", OPCOES_FRETE),
      condicaoPagamento: opcaoValida(formData, "condicaoPagamento", OPCOES_CONDICAO_PAGAMENTO),
      formaPagamento: opcaoValida(formData, "formaPagamento", OPCOES_FORMA_PAGAMENTO),
      transportadora: campoTexto(formData, "transportadora"),
      volumes,
      pesoBruto,
      observacoes: campoTexto(formData, "observacoes"),
      emailCopiaPedido: campoTexto(formData, "emailCopiaPedido"),
      emailXmlNfe: campoTexto(formData, "emailXmlNfe"),
      itens: { create: itensParaCriar },
    },
  });

  redirect(`/orcamentos/${orcamento.id}`);
}

// Edita um orçamento já salvo — cliente, itens (produtos/quantidades/
// tabela A ou B) e todas as "outras informações"/valores. Só é permitido
// enquanto o PDF daquele orçamento ainda não foi gerado (mesma trava usada
// pra observação por item, ver `salvarObservacaoItem` mais abaixo): depois
// do PDF gerado, editar poderia divergir do que já foi entregue/impresso
// pro cliente.
//
// Os itens são sempre substituídos por completo (apaga os antigos e recria
// a partir do que veio no formulário) em vez de tentar "atualizar no
// lugar" — mais simples e evita item órfão quando o representante remove
// um produto do orçamento na edição.
//
// Admin pode editar qualquer orçamento (em nome do representante dono);
// representante comum só os que ele mesmo criou.
export async function atualizarOrcamento(orcamentoId: number, formData: FormData) {
  const representante = await getRepresentanteLogado();
  if (!representante) redirect("/");

  const orcamentoAtual = await db.orcamento.findUnique({ where: { id: orcamentoId } });
  if (!orcamentoAtual) redirect("/orcamentos");

  const ehAdmin = representante.role === "ADMIN";
  const podeEditar = ehAdmin || orcamentoAtual!.representanteId === representante.id;
  if (!podeEditar) redirect("/orcamentos");

  // Caminho base pra onde voltar (view e edição), dependendo de quem está
  // editando — admin usa o painel /admin, representante comum o dele.
  const base = ehAdmin ? "/admin/orcamentos" : "/orcamentos";

  if (orcamentoAtual!.pdfGeradoEm) {
    redirect(
      `${base}/${orcamentoId}?erro=` +
        encodeURIComponent("Esse orçamento já teve o PDF gerado e não pode mais ser editado.")
    );
  }

  const clienteId = String(formData.get("clienteId") ?? "");
  const paginaEdicao = `${base}/${orcamentoId}/editar`;

  const resultado = await processarItensDoFormulario(formData);
  if ("erro" in resultado) {
    redirect(`${paginaEdicao}?erro=` + encodeURIComponent(resultado.erro));
  }

  if (!clienteId) {
    redirect(`${paginaEdicao}?erro=` + encodeURIComponent("Selecione o cliente."));
  }

  // Cliente tem que pertencer ao mesmo representante dono do orçamento —
  // não a quem estiver logado (relevante quando é o admin editando).
  const cliente = await db.cliente.findFirst({
    where: { id: clienteId, representanteId: orcamentoAtual!.representanteId },
  });
  if (!cliente) {
    redirect(`${paginaEdicao}?erro=` + encodeURIComponent("Cliente inválido."));
  }

  const {
    itensParaCriar,
    valorProdutos,
    descontoPercentual,
    descontoValor,
    ipiValor,
    freteValor,
    stValor,
    valorTotal,
    volumes,
    pesoBruto,
  } = resultado;

  await db.$transaction([
    db.itemOrcamento.deleteMany({ where: { orcamentoId } }),
    db.orcamento.update({
      where: { id: orcamentoId },
      data: {
        clienteId: cliente!.id,
        valorProdutos,
        descontoPercentual: descontoPercentual || null,
        descontoValor,
        ipiValor,
        stValor,
        freteValor,
        valorTotal,
        previsaoEntrega: campoTexto(formData, "previsaoEntrega"),
        ordemCompra: campoTexto(formData, "ordemCompra"),
        fretePorConta: opcaoValida(formData, "fretePorConta", OPCOES_FRETE),
        condicaoPagamento: opcaoValida(formData, "condicaoPagamento", OPCOES_CONDICAO_PAGAMENTO),
        formaPagamento: opcaoValida(formData, "formaPagamento", OPCOES_FORMA_PAGAMENTO),
        transportadora: campoTexto(formData, "transportadora"),
        volumes,
        pesoBruto,
        observacoes: campoTexto(formData, "observacoes"),
        emailCopiaPedido: campoTexto(formData, "emailCopiaPedido"),
        emailXmlNfe: campoTexto(formData, "emailXmlNfe"),
        itens: { create: itensParaCriar },
      },
    }),
  ]);

  revalidatePath(`/orcamentos/${orcamentoId}`);
  revalidatePath(`/admin/orcamentos/${orcamentoId}`);

  redirect(`${base}/${orcamentoId}`);
}

// Salva (ou apaga, se vazio) a observação de UM item de um orçamento já
// criado. Chamada direto de um componente client (modal de observação),
// não por <form>, então recebe os valores como argumentos normais.
export async function salvarObservacaoItem(itemId: string, observacaoRaw: string) {
  const representante = await getRepresentanteLogado();
  if (!representante) redirect("/");

  const item = await db.itemOrcamento.findUnique({
    where: { id: itemId },
    include: { orcamento: true },
  });
  if (!item) {
    throw new Error("Item não encontrado.");
  }

  // Só o representante dono do orçamento (ou um admin) pode editar —
  // mesma regra de posse usada no resto do app.
  const podeEditar =
    representante.role === "ADMIN" || item.orcamento.representanteId === representante.id;
  if (!podeEditar) {
    throw new Error("Você não tem permissão pra editar esse orçamento.");
  }

  // Trava: depois que o PDF já foi gerado uma vez, a observação não pode
  // mudar mais — evita divergência entre o que o representante escreveu e
  // o que já foi entregue/impresso pro cliente (pedido explícito do
  // usuário, pra não gerar discussão entre representante e quem aprova).
  if (item.orcamento.pdfGeradoEm) {
    throw new Error(
      "Esse orçamento já teve o PDF gerado — a observação não pode mais ser alterada."
    );
  }

  await db.itemOrcamento.update({
    where: { id: itemId },
    data: { observacao: normalizarObservacao(observacaoRaw) },
  });

  revalidatePath(`/orcamentos/${item.orcamentoId}`);
  revalidatePath(`/admin/orcamentos/${item.orcamentoId}`);
}
