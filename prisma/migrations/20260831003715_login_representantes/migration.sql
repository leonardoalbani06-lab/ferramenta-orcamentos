-- Login real por representante (usuário/senha), substituindo a
-- identificação por nome digitado (fase 1).
--
-- Decisão do usuário (2026-08-31): todos os representantes/clientes/
-- orçamentos hoje no banco são dados de teste, nenhum é válido de
-- verdade — por isso esta migration reseta essas 4 tabelas antes de
-- tornar username/senha obrigatórios, em vez de tentar migrar/backfillar
-- dados de teste. Produtos NÃO são afetados.
--
-- Depois de aplicar, é preciso rodar a seed de admin (ver prisma/seed.ts,
-- variáveis ADMIN_USERNAME/ADMIN_PASSWORD) pra ter a primeira conta pra
-- logar e cadastrar os demais representantes pelo painel /admin.

DELETE FROM "itens_orcamento";
DELETE FROM "orcamentos";
DELETE FROM "clientes";
DELETE FROM "representantes";

-- A identificação antiga usava "nome" como identificador único; agora
-- quem identifica a conta é "username".
DROP INDEX "representantes_nome_key";

ALTER TABLE "representantes" ADD COLUMN "username" TEXT NOT NULL DEFAULT '';
ALTER TABLE "representantes" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "representantes" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'REPRESENTANTE';
ALTER TABLE "representantes" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX "representantes_username_key" ON "representantes"("username");
