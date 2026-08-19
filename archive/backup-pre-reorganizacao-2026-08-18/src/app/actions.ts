"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clearRepresentanteId, getRepresentanteId, setRepresentanteId } from "@/lib/session";

export async function identificarRepresentante(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) {
    redirect("/?erro=" + encodeURIComponent("Informe seu nome."));
  }

  const representante = await db.representante.upsert({
    where: { nome },
    update: {},
    create: { nome },
  });

  await setRepresentanteId(representante.id);
  redirect("/clientes");
}

export async function sairRepresentante() {
  await clearRepresentanteId();
  redirect("/");
}

export async function criarCliente(formData: FormData) {
  const representanteId = await getRepresentanteId();
  if (!representanteId) redirect("/");

  const razaoSocial = String(formData.get("razaoSocial") ?? "").trim();
  const cnpj = String(formData.get("cnpj") ?? "").trim();

  if (!razaoSocial || !cnpj) {
    redirect(
      "/clientes/novo?erro=" + encodeURIComponent("Razão social e CNPJ são obrigatórios.")
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

type ItemInput = { codigo: string; quantidade: number };

export async function criarOrcamento(formData: FormData) {
  const representanteId = await getRepresentanteId();
  if (!representanteId) redirect("/");

  const clienteId = String(formData.get("clienteId") ?? "");
  const tabela = formData.get("tabela") === "B" ? "B" : "A";

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

  if (!clienteId || itensInput.length === 0) {
    redirect(
      "/orcamentos/novo?erro=" +
        encodeURIComponent("Selecione o cliente e ao menos um produto com quantidade.")
    );
  }

  const cliente = await db.cliente.findFirst({ where: { id: clienteId, representanteId } });
  if (!cliente) {
    redirect("/orcamentos/novo?erro=" + encodeURIComponent("Cliente inválido."));
  }

  const codigos = itensInput.map((i) => i.codigo);
  const produtos = await db.produto.findMany({ where: { codigo: { in: codigos } } });
  const produtoPorCodigo = new Map(produtos.map((p) => [p.codigo, p]));

  const itensParaCriar = itensInput
    .map((i) => {
      const produto = produtoPorCodigo.get(i.codigo);
      if (!produto) return null;
      const quantidade = Math.trunc(Number(i.quantidade));
      const valorUnitario = tabela === "A" ? produto.precoTabelaA : produto.precoTabelaB;
      const valorTotal = valorUnitario * quantidade;
      return {
        produtoCodigo: produto.codigo,
        descricao: produto.descricao,
        quantidade,
        valorUnitario,
        ipiPercentual: produto.ipiPercentual ?? 0,
        valorTotal,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  if (itensParaCriar.length === 0) {
    redirect("/orcamentos/novo?erro=" + encodeURIComponent("Nenhum produto válido selecionado."));
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

  const campo = (name: string) => {
    const valor = String(formData.get(name) ?? "").trim();
    return valor || null;
  };
  const numeroOuNull = (name: string) => {
    const valor = formData.get(name);
    if (!valor) return null;
    const n = Number(valor);
    return Number.isFinite(n) ? n : null;
  };

  const orcamento = await db.orcamento.create({
    data: {
      clienteId: cliente!.id,
      representanteId,
      tabelaUsada: tabela,
      valorProdutos,
      descontoPercentual: descontoPercentual || null,
      descontoValor,
      ipiValor,
      stValor,
      freteValor,
      valorTotal,
      previsaoEntrega: campo("previsaoEntrega"),
      ordemCompra: campo("ordemCompra"),
      fretePorConta: campo("fretePorConta"),
      condicaoPagamento: campo("condicaoPagamento"),
      formaPagamento: campo("formaPagamento"),
      transportadora: campo("transportadora"),
      volumes: numeroOuNull("volumes") !== null ? Math.trunc(numeroOuNull("volumes")!) : null,
      pesoBruto: numeroOuNull("pesoBruto"),
      observacoes: campo("observacoes"),
      emailCopiaPedido: campo("emailCopiaPedido"),
      emailXmlNfe: campo("emailXmlNfe"),
      itens: { create: itensParaCriar },
    },
  });

  redirect(`/orcamentos/${orcamento.id}`);
}
