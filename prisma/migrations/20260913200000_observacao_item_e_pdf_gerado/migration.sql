-- Observação por item do orçamento + trava de edição depois do PDF gerado.
--
-- "itens_orcamento.observacao": nota livre do representante sobre um item
-- específico do orçamento (ex: "sem estoque, prazo maior"). Nula até alguém
-- escrever alguma.
--
-- "orcamentos.pdfGeradoEm": marca a primeira vez que o PDF desse orçamento
-- foi gerado. A partir desse momento, as observações dos itens não podem
-- mais ser alteradas (ver ação `salvarObservacaoItem`) — evita divergência
-- entre o que o representante escreveu e o que já foi entregue/impresso.

ALTER TABLE "itens_orcamento" ADD COLUMN "observacao" TEXT;
ALTER TABLE "orcamentos" ADD COLUMN "pdfGeradoEm" DATETIME;
