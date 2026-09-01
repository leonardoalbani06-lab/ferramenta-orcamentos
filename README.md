# Olivapel — Ferramenta de Orçamentos

Ferramenta interna para representantes da D'Classe (marca Olivapel) montarem orçamentos:
login por usuário/senha, cadastro de clientes, catálogo navegável com
fotos, montagem de orçamento e geração de PDF no layout real da empresa.

Stack: Next.js 15 (App Router) + TypeScript + Tailwind + Prisma/SQLite +
`@react-pdf/renderer` + NextAuth.js (Auth.js) v5.

## Como rodar localmente

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL, AUTH_SECRET, ADMIN_USERNAME/PASSWORD
npx prisma migrate dev
npm run db:seed        # cria a 1ª conta admin (ADMIN_USERNAME/PASSWORD) + catálogo
npm run dev   # http://localhost:3000
```

Depois de logar com a conta admin, cadastre os demais representantes em
`/admin/representantes` — não existe autocadastro.

Pra inspecionar o banco visualmente:

```bash
npm run db:studio
```

## Funcionalidades

1. Login por usuário/senha (contas criadas só pelo admin, sem autocadastro)
2. Cadastro/listagem de clientes, isolado por representante
3. Catálogo navegável (categoria/busca), Tabela A/B, com foto por produto
4. Montagem e revisão de orçamento (desconto, IPI, ST, frete), com
   calendário próprio pra previsão de entrega e listas fixas pra forma/
   condição de pagamento e frete; volumes e peso bruto calculados
   automaticamente a partir dos itens
5. Geração de PDF no layout do orçamento aprovado de referência
6. Painel admin: criar conta de representante, ativar/desativar,
   redefinir senha (`/admin/representantes`); ver todos os clientes e
   orçamentos de todos os representantes e reatribuir o representante
   responsável por um cliente (`/admin/clientes`, `/admin/orcamentos`)

## Estrutura de pastas

```
src/
├── auth.ts               # config completa do NextAuth (Credentials + Prisma)
├── auth.config.ts         # config "edge-safe" (usada pelo middleware)
├── middleware.ts
├── app/
│   ├── page.tsx         # login (usuário/senha)
│   ├── actions.ts       # Server Actions
│   ├── api/auth/[...nextauth]/route.ts
│   ├── admin/             # exige role ADMIN
│   │   ├── representantes/
│   │   ├── clientes/       # todos os clientes, reatribuir representante
│   │   └── orcamentos/     # todos os orçamentos
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
