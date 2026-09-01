# Última sessão — 2026-09-01: CNPJ global, filtros admin, edição de cliente, cargo/último login

## O que foi feito

Sete frentes, todas aplicadas e testadas de ponta a ponta (rede normal
nesta sessão — `prisma generate`/`migrate dev`/`build` rodaram de
verdade, e testei via `curl` simulando os Server Actions reais, mais
alguns testes client-side via `javascript_tool` no navegador pros
filtros com `useMemo`):

1. **CNPJ de cliente único globalmente** (antes só por representante)
   — bloqueia cadastro/edição duplicado mostrando o nome do
   representante dono.
2. **Filtro por representante + resumo** em `/admin/clientes`,
   `/admin/orcamentos` e `/admin/representantes`, com o filtro
   sincronizado na URL (`?representanteId=`).
3. **Admin edita o cadastro completo do cliente** (`/admin/clientes/[id]`),
   não só o representante responsável.
4. **Campo "código do cliente"** (`Cliente.codigoCliente`) — obrigatório
   no cadastro novo, editável na tela do admin.
5. **Tela de detalhe/histórico do cliente** pro representante comum
   (`/clientes/[id]`) + "capa" do orçamento enriquecida (código, nome
   fantasia, telefone) em todo lugar que lista orçamentos.
6. **Cargo do representante editável** (ADMIN/REPRESENTANTE) com trava
   pra não remover o admin do último admin ativo.
7. **Último login** registrado e exibido em `/admin/representantes`.

## Arquivos alterados

Ver `.ai/memory/decisions.md` (cinco entradas de 2026-09-01, a partir
de "CNPJ de cliente passou a ser único globalmente").

## Problemas

Nenhum sem solução. Achado e documentado (não é bug do app): `curl -F`
nesse ambiente Windows corrompe valores com parênteses — ver última
entrada de `decisions.md`.

## Próximo passo

Ver `.ai/tasks/current.md` — configurar backup automático do volume
(pendente há duas sessões) e, quando o usuário informar, preencher
`Produto.peso`.
