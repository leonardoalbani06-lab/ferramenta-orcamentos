# Olivapel — Ferramenta de Orçamentos

## O que é

Ferramenta interna para representantes da D'Classe (grupo por trás da
marca Olivapel — o app usa essa identidade visual/nome) montarem
orçamentos pra clientes: identificação simples (sem senha), cadastro
de clientes isolado por representante, catálogo navegável com fotos,
montagem de orçamento com cálculo de desconto/IPI/ST/frete, e geração
de PDF no layout do orçamento real aprovado (nº 3811).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite (`prisma/dev.db`)
- `@react-pdf/renderer` pra gerar o PDF do orçamento
- `sharp` pra processar imagens de produto

## Fluxo do usuário

1. Representante entra só com o nome (`/`) — sem senha, fase 1.
2. Cadastra/lista os clientes que ele mesmo criou (`/clientes`).
3. Navega o catálogo por categoria/busca, alterna Tabela A/B
   (`/catalogo`).
4. Monta um orçamento pra um cliente: escolhe produtos com quantidade —
   **cada item escolhe sua própria Tabela A ou B** (não é mais uma
   escolha única pro orçamento inteiro) —, desconto, frete, ST, dados de
   entrega/pagamento (`/orcamentos/novo`).
5. Revisa o orçamento salvo e baixa o PDF (`/orcamentos/{id}`,
   `/orcamentos/{id}/pdf`).

Interface pensada mobile-first: barra de navegação fixa embaixo da tela
no celular (`BottomNav`, vira nav horizontal no topo em telas largas),
tabelas de produto viram cards no mobile, barra de ação fixa com o total
corrente no formulário de orçamento.

## Decisões de modelagem (schema)

- **Valores monetários em centavos (`Int`)**: evita erro de arredondamento
  com ponto flutuante. R$ 12,34 = `1234`.
- **`Cliente` isolado por representante**
  (`@@unique([representanteId, cnpj])`): cada representante só vê os
  clientes que ele cadastrou.
- **`ItemOrcamento` guarda snapshot** de descrição/preço/**tabela usada**
  no momento da venda — orçamentos antigos não mudam se o produto for
  atualizado depois. `Orcamento` **não tem** campo de tabela único (foi
  removido) — cada item pode vir de A ou B, o resumo é calculado a
  partir dos itens na hora de exibir.
- **`Orcamento.id` autoincremento** = número do orçamento, o mesmo que
  aparece no PDF.
- **`Produto.imagemUrl`** aponta pra `/produtos/{sku}.jpg` em `public/`
  (ver `.ai/memory/decisions.md` pra como as fotos foram extraídas).

## Identidade visual

O app usa a marca **Olivapel** de verdade agora (nome + logo oficial),
não só como referência de estilo — decisão de 2026-08-19 (ver
`.ai/memory/decisions.md`). Logo oficial (árvore + lettering) em
`public/brand/`: `olivapel-mark-olive.png` (tinta verde-oliva,
transparente, pra fundo claro — login, PDF) e
`olivapel-mark-cream.png` (tinta creme, transparente, pra fundo escuro
— cabeçalho). Gerados a partir do master em
`public/brand/source/olivapel-master.png` via
`scripts/gerar-logo-olivapel.mjs` (recolore por luminância + `sharp`,
não precisa refazer manualmente se vier um master novo).

Paleta e tipografia continuam vindas do site real da Olivapel
(olivapel.com.br): verde-oliva profundo (`#3E4633` e variações),
dourado (`#D4AF5A`), creme (`#EDE9D8`); fontes Cinzel (títulos) +
Montserrat (corpo). Tokens em `tailwind.config.ts` (`brand.*`).

## Estrutura de pastas

```
src/
├── app/
│   ├── page.tsx              # login (identificação do representante)
│   ├── actions.ts            # todas as Server Actions do app
│   └── (app)/                # tudo que exige login (route group)
│       ├── layout.tsx        # cabeçalho/nav compartilhado
│       ├── clientes/
│       ├── catalogo/
│       └── orcamentos/
│           ├── novo/         # OrcamentoBuilder.tsx (client component)
│           └── [id]/         # detalhe + pdf/route.tsx
├── components/                # BrandLeaf, ProdutoThumb, BottomNav (compartilhados)
└── lib/
    ├── db.ts, session.ts, format.ts
    └── pdf/OrcamentoDocument.tsx

prisma/
├── schema.prisma
├── seed.ts + seed-data/produtos.json   # catálogo (51 SKUs)
└── migrations/

public/produtos/    # fotos dos produtos (42 de 51 SKUs têm foto)
.claude/hooks/       # backup-before-compact.sh, remind-update-context.sh
scripts/            # extrair-fotos.mjs, ligar-fotos-catalogo.mjs
```

## Como rodar

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev   # http://localhost:3000
```

## Ferramenta relacionada (projeto separado)

`C:\Users\leona\Desktop\Gerenciador Catalogo DClasse` — app avulso
(Next.js + Prisma + SQLite próprio, **não** faz parte deste projeto e
não é importado por ele) pro usuário organizar categoria(s)/marca(s)/
unidade dos 51 produtos, com exportação em JSON. Quando o usuário
devolver esse JSON, o modelo `Produto` aqui precisa evoluir pra
muitos-para-muitos com `Categoria`/`Marca` (hoje `categoria` é só um
campo texto único). Ver `.ai/memory/decisions.md` pro histórico.
