-- Tabela A/B passa a ser escolhida por item, não mais por orçamento inteiro.
-- Backfill: itens existentes (criados quando a escolha era global) assumem 'A'.

ALTER TABLE "itens_orcamento" ADD COLUMN "tabelaUsada" TEXT NOT NULL DEFAULT 'A';

ALTER TABLE "orcamentos" DROP COLUMN "tabelaUsada";
