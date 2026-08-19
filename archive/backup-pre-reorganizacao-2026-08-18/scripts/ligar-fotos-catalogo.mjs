// Preenche "imagemUrl" em produtos.json pra todo SKU que já tem um
// arquivo correspondente em public/produtos/.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const CAMINHO_JSON = path.join(process.cwd(), "prisma", "seed-data", "produtos.json");
const PASTA_PRODUTOS = path.join(process.cwd(), "public", "produtos");

const produtos = JSON.parse(readFileSync(CAMINHO_JSON, "utf-8"));

let atualizados = 0;
for (const p of produtos) {
  const nomeArquivo = `${p.codigo.replace(/\//g, "-")}.jpg`;
  if (existsSync(path.join(PASTA_PRODUTOS, nomeArquivo))) {
    p.imagemUrl = `/produtos/${nomeArquivo}`;
    atualizados++;
  } else {
    p.imagemUrl = null;
  }
}

writeFileSync(CAMINHO_JSON, JSON.stringify(produtos, null, 2) + "\n");
console.log(`${atualizados} de ${produtos.length} produtos ganharam imagemUrl.`);
console.log("Sem foto:", produtos.filter((p) => !p.imagemUrl).map((p) => p.codigo).join(", "));
