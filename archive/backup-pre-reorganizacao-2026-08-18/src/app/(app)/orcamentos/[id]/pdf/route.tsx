import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OrcamentoDocument } from "@/lib/pdf/OrcamentoDocument";
import { getRepresentanteId } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const representanteId = await getRepresentanteId();
  if (!representanteId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const orcamentoId = Number(id);
  if (!Number.isInteger(orcamentoId)) {
    return NextResponse.redirect(new URL("/orcamentos", request.url));
  }

  const orcamento = await db.orcamento.findFirst({
    where: { id: orcamentoId, representanteId },
    include: {
      cliente: true,
      representante: true,
      itens: { include: { produto: true } },
    },
  });
  if (!orcamento) {
    return NextResponse.redirect(new URL("/orcamentos", request.url));
  }

  const buffer = await renderToBuffer(<OrcamentoDocument orcamento={orcamento} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orcamento-${orcamento.id}.pdf"`,
    },
  });
}
