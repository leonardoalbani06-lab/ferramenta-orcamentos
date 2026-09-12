import fs from "fs";
import { NextResponse } from "next/server";
import { getRepresentanteLogado } from "@/lib/session";

// Backup manual do banco — enquanto o plano da Railway não tem backup
// automático de volume/PITR (só disponível no plano Pro), esta rota
// deixa o admin baixar uma cópia do arquivo SQLite de produção sempre
// que quiser, direto pelo navegador.
//
// O middleware já bloqueia "/admin/*" pra quem não é ADMIN, mas a rota
// confere de novo aqui — mesma regra do resto do projeto: nunca confiar
// só numa camada de proteção.
export async function GET() {
  const representante = await getRepresentanteLogado();
  if (!representante || representante.role !== "ADMIN") {
    return new NextResponse("Não autorizado", { status: 403 });
  }

  const databaseUrl = process.env.DATABASE_URL ?? "";
  const caminhoArquivo = databaseUrl.replace(/^file:/, "");

  if (!caminhoArquivo || !fs.existsSync(caminhoArquivo)) {
    return new NextResponse(
      "Banco não encontrado neste ambiente (DATABASE_URL não aponta pra um arquivo SQLite local).",
      { status: 500 },
    );
  }

  const conteudo = fs.readFileSync(caminhoArquivo);
  const dataHoje = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Uint8Array(conteudo), {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="backup-ferramenta-orcamentos-${dataHoje}.db"`,
      "Content-Length": String(conteudo.length),
      "Cache-Control": "no-store",
    },
  });
}
