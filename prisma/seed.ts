import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import produtos from "./seed-data/produtos.json";

const prisma = new PrismaClient();

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.log(
      "ADMIN_USERNAME/ADMIN_PASSWORD não definidos — pulando criação da conta admin " +
        "(defina as duas variáveis de ambiente e rode a seed de novo pra criar a " +
        "primeira conta que consegue logar e cadastrar os demais representantes)."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.representante.upsert({
    where: { username },
    update: { passwordHash, role: "ADMIN", ativo: true },
    create: { nome: "Admin", username, passwordHash, role: "ADMIN" },
  });
  console.log(`Conta admin "${username}" pronta.`);
}

async function main() {
  await seedAdmin();

  console.log(`Semeando ${produtos.length} produtos...`);

  for (const p of produtos) {
    await prisma.produto.upsert({
      where: { codigo: p.codigo },
      update: {
        descricao: p.descricao,
        categoria: p.categoria,
        ncm: p.ncm,
        unidade: p.unidade,
        precoTabelaA: p.precoTabelaA,
        precoTabelaB: p.precoTabelaB,
        imagemUrl: p.imagemUrl ?? null,
      },
      create: {
        codigo: p.codigo,
        descricao: p.descricao,
        categoria: p.categoria,
        ncm: p.ncm,
        unidade: p.unidade,
        precoTabelaA: p.precoTabelaA,
        precoTabelaB: p.precoTabelaB,
        imagemUrl: p.imagemUrl ?? null,
      },
    });
  }

  console.log("Catálogo semeado com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
