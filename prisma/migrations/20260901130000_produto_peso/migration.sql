-- Adiciona o peso unitário (kg) ao Produto — estrutura pronta pra calcular
-- automaticamente o "peso bruto" de um orçamento (soma de quantidade × peso
-- dos itens selecionados). Os valores de peso por produto ainda não foram
-- informados pelo usuário; a coluna fica nula até serem preenchidos (mesmo
-- padrão já usado antes pra NCM/unidade/código de barras).

ALTER TABLE "produtos" ADD COLUMN "peso" REAL;
