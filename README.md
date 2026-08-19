# Olivapel — Ferramenta de Orçamentos

Ferramenta interna para representantes da D'Classe (marca Olivapel) montarem orçamentos:
identificação simples, cadastro de clientes, catálogo navegável com
fotos, montagem de orçamento e geração de PDF no layout real da empresa.

Stack: Next.js 15 (App Router) + TypeScript + Tailwind + Prisma/SQLite +
`@react-pdf/renderer`.

## Como rodar localmente

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev   # http://localhost:3000
```

Pra inspecionar o banco visualmente:

```bash
npm run db:studio
```

## Funcionalidades

1. Identificação do representante (nome, sem senha — fase 1)
2. Cadastro/listagem de clientes, isolado por representante
3. Catálogo navegável (categoria/busca), Tabela A/B, com foto por produto
4. Montagem e revisão de orçamento (desconto, IPI, ST, frete)
5. Geração de PDF no layout do orçamento aprovado de referência

## Estrutura de pastas

```
src/
├── app/
│   ├── page.tsx         # login (identificação do representante)
│   ├── actions.ts       # Server Actions
│   └── (app)/           # rotas que exigem login
│       ├── clientes/
│       ├── catalogo/
│       └── orcamentos/
├── components/
└── lib/
    └── pdf/              # geração do PDF do orçamento

prisma/
├── schema.prisma
├── seed.ts + seed-data/  # catálogo de produtos
└── migrations/

public/produtos/    # fotos dos produtos (nome = SKU)
scripts/            # utilitários (extração/associação de fotos)
```

## Contexto pra retomar o projeto

Este projeto usa uma pasta `.ai/` como contexto persistente entre
sessões (visão geral, estado atual, decisões, tarefas) — ver
[`CLAUDE.md`](./CLAUDE.md) pra onde encontrar cada coisa.
