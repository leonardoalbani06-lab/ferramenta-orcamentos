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
