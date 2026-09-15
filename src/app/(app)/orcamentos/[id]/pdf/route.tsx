import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OrcamentoDocument } from "@/lib/pdf/OrcamentoDocument";
import { getRepresentanteLogado } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const representante = await getRepresentanteLogado();
  if (!representante) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const orcamentoId = Number(id);
  if (!Number.isInteger(orcamentoId)) {
    return NextResponse.redirect(new URL("/orcamentos", request.url));
  }

  // Admin baixa o PDF de qualquer orçamento (painel /admin/orcamentos);
  // representante comum só o dos orçamentos que ele mesmo criou.
  const filtroDono = representante.role === "ADMIN" ? {} : { representanteId: representante.id };

  const orcamento = await db.orcamento.findFirst({
    where: { id: orcamentoId, ...filtroDono },
    include: {
      cliente: true,
      representante: true,
      itens: { include: { produto: true } },
    },
  });
  if (!orcamento) {
    return NextResponse.redirect(new URL("/orcamentos", request.url));
  }

  // Primeira vez que o PDF desse orçamento é gerado: trava as observações
  // por item a partir de agora (ver `salvarObservacaoItem` em actions.ts) —
  // evita que o texto mude depois que o PDF já foi entregue/impresso.
  // Downloads seguintes não mexem mais nessa data.
  if (!orcamento.pdfGeradoEm) {
    await db.orcamento.update({
      where: { id: orcamento.id },
      data: { pdfGeradoEm: new Date() },
    });
  }

  const buffer = await renderToBuffer(<OrcamentoDocument orcamento={orcamento} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orcamento-${orcamento.id}.pdf"`,
    },
  });
}
