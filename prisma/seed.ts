import { PrismaClient } from "@prisma/client";
import produtos from "./seed-data/produtos.json";

const prisma = new PrismaClient();

async function main() {
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
