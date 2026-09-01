# CLAUDE.md

Mapa do projeto **Olivapel — Ferramenta de Orçamentos** (marca D'Classe)
(Next.js + Prisma/SQLite). Visão completa em `.ai/context/project-overview.md`.

## Antes de iniciar qualquer tarefa

1. Leia este arquivo.
2. Leia `.ai/context/current-state.md`.
3. Leia `.ai/tasks/current.md`.
4. Consulte outros arquivos só se forem relevantes pra tarefa.

Não carregue `.ai/summaries/`, `archive/` ou `prisma/seed-data/*.json`
inteiro automaticamente — só quando a tarefa precisar especificamente
disso.

## Diretórios principais

- `src/app/` — rotas Next.js (App Router). `page.tsx` na raiz é o login
  (usuário/senha); `(app)/` exige representante logado; `admin/` exige
  role `ADMIN` (gerenciar contas de representante).
- `src/app/actions.ts` — Server Actions do app principal (login, clientes,
  orçamentos). `src/app/admin/actions.ts` — Server Actions do painel admin
  (cada uma confere `role === "ADMIN"` de novo no servidor).
- `src/auth.ts` / `src/auth.config.ts` — NextAuth (Auth.js) v5, Credentials
  provider. `auth.config.ts` é a parte "edge-safe" (sem Prisma/bcrypt),
  usada pelo `middleware.ts`; `auth.ts` tem a config completa.
- `src/components/` — componentes compartilhados entre telas.
- `src/lib/` — `db.ts` (Prisma client), `session.ts` (helpers sobre a
  sessão do NextAuth), `format.ts` (formatação pt-BR),
  `pdf/OrcamentoDocument.tsx` (layout do PDF).
- `prisma/` — schema, migrations, seed do catálogo.
- `public/produtos/` — fotos dos produtos (nome do arquivo = SKU).
- `scripts/` — utilitários pontuais (extração/associação de fotos).
- `.ai/` — contexto pra retomar sessões (ver abaixo).
- `archive/` — arquivos obsoletos preservados (nunca sobrescrever,
  nunca fonte de verdade pra nada).

## Onde encontrar contexto

- Visão geral do projeto: `.ai/context/project-overview.md`
- Estado atual / o que falta: `.ai/context/current-state.md`
- Decisões importantes já tomadas (e o porquê): `.ai/memory/decisions.md`
- Tarefa em andamento: `.ai/tasks/current.md`
- Resumo da última sessão relevante: `.ai/summaries/latest-summary.md`

## Convenções

- Nomes de variáveis, funções e textos de UI em português; código
  (imports, tipos) em inglês/padrão do framework.
- Valores monetários sempre em centavos (`Int`) no banco.
- Nunca confiar em preço/descrição vindos do client — Server Actions
  sempre rebuscam o `Produto` no banco antes de gravar um `Orcamento`.
- Cores/tipografia da marca: usar os tokens `brand.*` do
  `tailwind.config.ts`, não inventar cor nova ad-hoc.

## Depois de uma alteração relevante

Atualize `.ai/context/current-state.md`, registre em
`.ai/memory/decisions.md` se foi uma decisão não-óbvia, e atualize
`.ai/tasks/current.md` / `.ai/summaries/latest-summary.md`. Não
atualize esses arquivos por atualizar — só quando algo realmente mudou.
