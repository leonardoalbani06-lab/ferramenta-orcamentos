-- Três mudanças de schema desta rodada, agrupadas numa migration só:
--
-- 1) CNPJ de cliente passa a ser único GLOBALMENTE (não mais só por
--    representante) — um CNPJ é sempre o mesmo cliente, não importa quem
--    cadastrou. Confirmado sem duplicata de CNPJ entre representantes
--    tanto local quanto em produção antes de aplicar esta migration.
-- 2) Cliente ganha "codigoCliente" (texto livre, preenchido pelo
--    representante) — nullable pra não quebrar clientes já cadastrados.
-- 3) Representante ganha "ultimoLoginEm", atualizado no authorize() do
--    NextAuth a cada login bem-sucedido.

ALTER TABLE "clientes" ADD COLUMN "codigoCliente" TEXT;
ALTER TABLE "representantes" ADD COLUMN "ultimoLoginEm" DATETIME;

DROP INDEX "clientes_representanteId_cnpj_key";
CREATE UNIQUE INDEX "clientes_cnpj_key" ON "clientes"("cnpj");
