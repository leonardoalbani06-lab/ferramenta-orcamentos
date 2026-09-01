"use server";

import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";

// Confere de novo no servidor que quem chamou é admin — o middleware já
// bloqueia navegação pra /admin, mas Server Actions podem ser chamadas
// diretamente, então cada mutação confere o role por conta própria.
async function exigirAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Não autorizado.");
  }
}

export async function criarRepresentante(formData: FormData) {
  await exigirAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "REPRESENTANTE";

  if (!nome || !username || !password) {
    redirect(
      "/admin/representantes?erro=" +
        encodeURIComponent("Nome, usuário e senha são obrigatórios.")
    );
  }
  if (password.length < 6) {
    redirect(
      "/admin/representantes?erro=" +
        encodeURIComponent("A senha precisa ter pelo menos 6 caracteres.")
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db.representante.create({
      data: { nome, username, passwordHash, role },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(
        "/admin/representantes?erro=" +
          encodeURIComponent("Já existe um representante com esse usuário.")
      );
    }
    throw error;
  }

  revalidatePath("/admin/representantes");
  redirect("/admin/representantes");
}

export async function alternarAtivoRepresentante(formData: FormData) {
  await exigirAdmin();

  const id = String(formData.get("id") ?? "");
  const ativo = formData.get("ativo") === "true";
  if (!id) return;

  await db.representante.update({ where: { id }, data: { ativo: !ativo } });
  revalidatePath("/admin/representantes");
}

export async function redefinirSenhaRepresentante(formData: FormData) {
  await exigirAdmin();

  const id = String(formData.get("id") ?? "");
  const novaSenha = String(formData.get("novaSenha") ?? "");
  if (!id || novaSenha.length < 6) {
    redirect(
      "/admin/representantes?erro=" +
        encodeURIComponent("A nova senha precisa ter pelo menos 6 caracteres.")
    );
  }

  const passwordHash = await bcrypt.hash(novaSenha, 10);
  await db.representante.update({ where: { id }, data: { passwordHash } });

  revalidatePath("/admin/representantes");
  redirect("/admin/representantes?sucesso=" + encodeURIComponent("Senha redefinida."));
}

// Reatribui o cliente pra outro representante. Só troca o dono do cadastro
// do cliente (Cliente.representanteId) — decisão do usuário (2026-09-01):
// os orçamentos já criados continuam como estão (cada um guarda o próprio
// `representanteId`, de quem montou aquele orçamento na época), só os
// orçamentos NOVOS desse cliente é que passam a ser do representante novo
// (naturalmente, porque só quem é dono do cliente consegue selecioná-lo
// pra montar orçamento — ver `criarOrcamento` em src/app/actions.ts).
export async function alterarRepresentanteCliente(formData: FormData) {
  await exigirAdmin();

  const clienteId = String(formData.get("clienteId") ?? "");
  const representanteId = String(formData.get("representanteId") ?? "");
  // Caminho da página que chamou (pra revalidar ela também — ex:
  // /admin/orcamentos/42 — além das listas gerais). Opcional.
  const paginaAtual = String(formData.get("paginaAtual") ?? "").trim();
  if (!clienteId || !representanteId) return;

  const [cliente, representante] = await Promise.all([
    db.cliente.findUnique({ where: { id: clienteId } }),
    db.representante.findUnique({ where: { id: representanteId } }),
  ]);
  if (!cliente || !representante) return;

  await db.cliente.update({ where: { id: clienteId }, data: { representanteId } });

  revalidatePath("/admin/clientes");
  revalidatePath("/admin/orcamentos");
  if (paginaAtual.startsWith("/admin/")) revalidatePath(paginaAtual);
}

// Admin edita o cadastro completo do cliente (todos os campos, não só o
// representante responsável — isso continua sendo feito à parte por
// `alterarRepresentanteCliente`/`ReatribuirRepresentante`).
export async function atualizarClienteAdmin(formData: FormData) {
  await exigirAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/clientes");

  const razaoSocial = String(formData.get("razaoSocial") ?? "").trim();
  const cnpj = String(formData.get("cnpj") ?? "").trim();

  if (!razaoSocial || !cnpj) {
    redirect(
      `/admin/clientes/${id}?erro=` +
        encodeURIComponent("Razão social e CNPJ são obrigatórios.")
    );
  }

  // Mesma checagem de unicidade global de CNPJ do cadastro normal
  // (`criarCliente`), mas ignorando o próprio cliente sendo editado.
  const donoDoCnpj = await db.cliente.findUnique({
    where: { cnpj },
    include: { representante: true },
  });
  if (donoDoCnpj && donoDoCnpj.id !== id) {
    redirect(
      `/admin/clientes/${id}?erro=` +
        encodeURIComponent(
          `Esse CNPJ já está cadastrado, em nome do representante ${donoDoCnpj.representante.nome}.`
        )
    );
  }

  const campo = (name: string) => {
    const valor = String(formData.get(name) ?? "").trim();
    return valor || null;
  };

  try {
    await db.cliente.update({
      where: { id },
      data: {
        codigoCliente: campo("codigoCliente"),
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
        `/admin/clientes/${id}?erro=` + encodeURIComponent("Esse CNPJ já está em uso.")
      );
    }
    throw error;
  }

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  redirect(`/admin/clientes/${id}?sucesso=` + encodeURIComponent("Cliente atualizado."));
}

// Troca o role (ADMIN/REPRESENTANTE) de um representante. Não deixa
// remover o role ADMIN do último admin ativo — sem essa trava seria
// possível todo mundo ficar trancado fora de /admin sem querer.
export async function alterarRoleRepresentante(formData: FormData) {
  await exigirAdmin();

  const id = String(formData.get("id") ?? "");
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "REPRESENTANTE";
  if (!id) return;

  if (role === "REPRESENTANTE") {
    const representante = await db.representante.findUnique({ where: { id } });
    if (representante?.role === "ADMIN") {
      const outrosAdminsAtivos = await db.representante.count({
        where: { role: "ADMIN", ativo: true, id: { not: id } },
      });
      if (outrosAdminsAtivos === 0) {
        redirect(
          "/admin/representantes?erro=" +
            encodeURIComponent(
              "Não é possível remover o admin do último administrador ativo."
            )
        );
      }
    }
  }

  await db.representante.update({ where: { id }, data: { role } });
  revalidatePath("/admin/representantes");
}
